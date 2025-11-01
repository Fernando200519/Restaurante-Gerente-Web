import React from "react";
import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
  pageTitle?: string;
}

const Layout: React.FC<Props> = ({ children, pageTitle }) => {
  return (
    <div className="min-h-screen flex bg-[#F3F4F6]">
      <Sidebar />

      <div className="lg:ml-64 flex-1 flex flex-col">
        <main className="p-6 lg:p-8">
          {pageTitle && (
            <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
          )}
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
