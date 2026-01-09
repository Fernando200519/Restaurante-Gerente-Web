import React from "react";
import { FolderTree, Package } from "lucide-react";

interface MenuTabsProps {
  activeTab: "categories" | "products";
  onTabChange: (tab: "categories" | "products") => void;
}

const MenuTabs: React.FC<MenuTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "categories" as const,
      label: "Categorías",
      icon: FolderTree,
    },
    {
      id: "products" as const,
      label: "Productos",
      icon: Package,
    },
  ];

  return (
    <div className="flex p-1 bg-gray-100/80 rounded-xl w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
              ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              }
            `}
          >
            <Icon
              size={18}
              className={isActive ? "text-[#FF8108]" : "text-gray-400"}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MenuTabs;
