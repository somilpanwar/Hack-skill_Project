import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center gap-3 border border-indigo-100 hover:shadow-lg transition-shadow">
      <div className="text-orange-400 text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-lg mb-1 text-indigo-600">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;
