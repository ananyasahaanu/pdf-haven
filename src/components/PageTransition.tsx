import { useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionState, setTransitionState] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    setTransitionState("exit");
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setTransitionState("enter");
    }, 200);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // On first mount, just show children
  useEffect(() => {
    setDisplayChildren(children);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        transitionState === "enter"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      }`}
    >
      {displayChildren}
    </div>
  );
}
