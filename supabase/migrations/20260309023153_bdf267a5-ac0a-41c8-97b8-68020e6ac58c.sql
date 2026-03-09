
-- Create admin notifications table
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'purchase_request',
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can read notifications
CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update (mark as read)
CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow service role to insert (from edge function/trigger)
CREATE POLICY "Service role can insert notifications"
  ON public.admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow delete for admins
CREATE POLICY "Admins can delete notifications"
  ON public.admin_notifications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to auto-create notification on new purchase request
CREATE OR REPLACE FUNCTION public.notify_admin_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, metadata)
  VALUES (
    'New Purchase Request',
    NEW.customer_name || ' requested "' || NEW.product_title || '" (৳' || NEW.product_price || ')',
    'purchase_request',
    jsonb_build_object('purchase_request_id', NEW.id, 'customer_name', NEW.customer_name, 'product_title', NEW.product_title, 'product_price', NEW.product_price, 'payment_method', NEW.payment_method)
  );

  -- Call edge function for external notifications (email + slack)
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-admin',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'customer_name', NEW.customer_name,
      'product_title', NEW.product_title,
      'product_price', NEW.product_price,
      'payment_method', NEW.payment_method,
      'transaction_id', NEW.transaction_id
    )
  );

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_new_purchase_request
  AFTER INSERT ON public.purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_purchase();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
