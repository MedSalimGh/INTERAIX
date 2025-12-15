import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="root-layout min-h-screen">
      {children}
    </main>
  );
};

export default Layout;
