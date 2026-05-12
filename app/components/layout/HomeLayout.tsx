"use client";

import { ReactNode } from "react";

export function HomeLayout({
  tablesPanel,
  menuPanel,
  cartPanel,
  modals,
}: {
  tablesPanel: ReactNode;
  menuPanel: ReactNode;
  cartPanel: ReactNode;
  modals?: ReactNode;
}) {
  return (
    <main className="home-layout">
      <div className="top-navbar">
        <div className="top-left">
          <h1 className="top-logo">SatoSan</h1>
          <span className="top-subtitle">Restaurant Dashboard</span>
        </div>
        <div className="top-nav-links">
          <button className="top-nav-button top-nav-active">Dashboard</button>
          <button className="top-nav-button">Cocina</button>
          <button className="top-nav-button">Historial</button>
          <button className="top-nav-button">Productos</button>
        </div>
      </div>
      <div className="home-content">
        {tablesPanel}
        {menuPanel}
        {cartPanel}
      </div>
      {modals}
    </main>
  );
}
