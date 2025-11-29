
import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon, ArrowLeftIcon } from './icons';

function Layout(props) {
  var children = props.children;
  var title = props.title;
  var onBack = props.onBack;
  var showBack = props.showBack;
  var colorTheme = props.colorTheme || 'violet'; // violet, emerald, rose, cyan
  var menuItems = props.menuItems || [];
  
  var sidebarOpenState = useState(false);
  var isSidebarOpen = sidebarOpenState[0];
  var setIsSidebarOpen = sidebarOpenState[1];

  var getThemeClasses = function(theme) {
    switch (theme) {
        case 'emerald': return { bg: 'bg-emerald-600', text: 'text-emerald-600', hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' };
        case 'rose': return { bg: 'bg-rose-600', text: 'text-rose-600', hover: 'hover:bg-rose-50 dark:hover:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800' };
        case 'cyan': return { bg: 'bg-cyan-600', text: 'text-cyan-600', hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800' };
        default: return { bg: 'bg-violet-600', text: 'text-violet-600', hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' };
    }
  };

  var theme = getThemeClasses(colorTheme);

  var handleToggleSidebar = function() {
    setIsSidebarOpen(!isSidebarOpen);
  };

  var handleMenuItemClick = function(action) {
    setIsSidebarOpen(false);
    if (action) action();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-gray-100 flex flex-col">
      {/* Top Bar */}
      <header className={"sticky top-0 z-40 w-full shadow-md backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-slate-200 dark:border-gray-800"}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {menuItems.length > 0 && (
                <button onClick={handleToggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition">
                    <Bars3Icon className="w-6 h-6" />
                </button>
            )}
            {showBack && (
                <button onClick={onBack} className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 text-sm font-medium text-slate-600 dark:text-gray-300 transition">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </button>
            )}
          </div>
          <h1 className={"text-lg font-bold truncate " + theme.text}>{title}</h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* Sidebar / Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleToggleSidebar}></div>
            
            {/* Drawer Content */}
            <div className="relative w-80 max-w-[80%] bg-white dark:bg-gray-900 shadow-2xl flex flex-col h-full animate-slide-in-left">
                <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className={"font-bold text-lg " + theme.text}>Study Modules</h2>
                    <button onClick={handleToggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    {menuItems.map(function(item, index) {
                        return (
                            <button 
                                key={index} 
                                onClick={function() { handleMenuItemClick(item.onClick); }}
                                className={"w-full text-left px-6 py-4 flex items-center gap-4 transition-colors " + theme.hover}
                            >
                                <div className={"p-2 rounded-md " + (item.active ? theme.bg + " text-white" : "bg-slate-100 dark:bg-gray-800 text-slate-500")}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-gray-200">{item.label}</p>
                                    {item.desc && <p className="text-xs text-slate-500">{item.desc}</p>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

export default Layout;
