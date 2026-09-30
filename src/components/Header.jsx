import React from 'react';

import {
  ChevronRight,
  Menu,
  Search,
  Bell
} from 'lucide-react';

export default function Header({ title, setMobile }) {
  return (
    <header>
      <button
        className="hamb"
        onClick={() => setMobile(true)}
      >
        <Menu />
      </button>

      <div className="crumb">
        EcoGestão
        <ChevronRight size={14} />
        <b>{title}</b>
      </div>

      <div className="header-right">
        <span className="today">
          Segunda-feira, 28 de setembro
        </span>

        <button className="icon-btn">
          <Search size={18} />
        </button>

        <button className="icon-btn notification">
          <Bell size={18} />
          <i />
        </button>

        <div className="avatar small-avatar">
          AC
        </div>
      </div>
    </header>
  );
}