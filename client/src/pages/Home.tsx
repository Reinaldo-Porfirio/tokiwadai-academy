import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Tokiwadai Academy</h1>
        <p>Redirecionando para login...</p>
      </div>
    </div>
  );
}
