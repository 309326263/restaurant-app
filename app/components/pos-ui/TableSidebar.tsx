"use client";

type Props = {
  children: React.ReactNode;
};

export function TableSidebar({ children }: Props) {
  return (
    <div className="home-sidebar">
      <div className="panel-scroll">
        {children}
      </div>
    </div>
  );
}