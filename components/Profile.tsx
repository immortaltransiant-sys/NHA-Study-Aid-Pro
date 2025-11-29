
import React, { useState } from 'react';
import { UserIcon, CreditCardIcon, ShoppingBagIcon, ShieldCheckIcon } from './icons';

function Profile(props) {
  var colorTheme = props.colorTheme || 'violet';

  // Mock Data for demonstration
  var userDetails = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    memberSince: "August 2024",
    subscription: "Pro - Monthly"
  };

  var purchaseHistory = [
    { id: 1, date: "2024-10-15", item: "NHA Study Aid Pro - Monthly", amount: "$9.99" },
    { id: 2, date: "2024-09-15", item: "NHA Study Aid Pro - Monthly", amount: "$9.99" },
    { id: 3, date: "2024-08-15", item: "NHA Study Aid Pro - Monthly", amount: "$9.99" }
  ];

  var getThemeColor = function() {
    if (colorTheme === 'emerald') return "emerald";
    if (colorTheme === 'rose') return "rose";
    if (colorTheme === 'cyan') return "cyan";
    return "violet";
  };
  var theme = getThemeColor();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-slate-200 dark:border-gray-800">
        <div className={"w-24 h-24 rounded-full flex items-center justify-center bg-" + theme + "-100 text-" + theme + "-600 dark:bg-" + theme + "-900/50 dark:text-" + theme + "-400"}>
           <UserIcon className="w-12 h-12" />
        </div>
        <div className="text-center md:text-left">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userDetails.name}</h2>
           <p className="text-slate-500 dark:text-gray-400">{userDetails.email}</p>
           <span className={"inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-" + theme + "-100 text-" + theme + "-700 dark:bg-" + theme + "-900 dark:text-" + theme + "-300"}>
             {userDetails.subscription} Member
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 p-6">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-gray-800 pb-4">
                <UserIcon className={"w-5 h-5 text-" + theme + "-600"} />
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">My Details</h3>
             </div>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-gray-400">Full Name</label>
                    <input type="text" readOnly value={userDetails.name} className="mt-1 block w-full rounded-md border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-gray-400">Email Address</label>
                    <input type="email" readOnly value={userDetails.email} className="mt-1 block w-full rounded-md border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-gray-400">Member Since</label>
                    <input type="text" readOnly value={userDetails.memberSince} className="mt-1 block w-full rounded-md border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm p-2" />
                </div>
             </div>
          </div>

          {/* Billing Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 p-6 flex flex-col">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-gray-800 pb-4">
                <CreditCardIcon className={"w-5 h-5 text-" + theme + "-600"} />
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Payment Method</h3>
             </div>
             <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-slate-200 dark:border-gray-700">
                <div className="w-full max-w-xs bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-6 text-white shadow-lg mb-4">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-10 h-6 bg-white/20 rounded"></div>
                        <span className="font-mono text-xs opacity-70">CREDIT</span>
                    </div>
                    <div className="font-mono text-xl tracking-widest mb-4">**** **** **** 4242</div>
                    <div className="flex justify-between text-xs opacity-70">
                        <span>CARD HOLDER</span>
                        <span>EXPIRES</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                        <span>ALEX DOE</span>
                        <span>12/28</span>
                    </div>
                </div>
                <button className={"text-sm font-semibold hover:underline text-" + theme + "-600"}>Update Payment Method</button>
             </div>
          </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-slate-200 dark:border-gray-800 p-6">
         <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-gray-800 pb-4">
            <ShoppingBagIcon className={"w-5 h-5 text-" + theme + "-600"} />
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Purchase History</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-700">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-slate-200 dark:divide-gray-800">
                    {purchaseHistory.map(function(purchase) {
                        return (
                            <tr key={purchase.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-gray-300">{purchase.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-gray-300">{purchase.item}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-900 dark:text-white">{purchase.amount}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
         </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-slate-50 dark:bg-gray-800 rounded-xl shadow-inner border border-slate-200 dark:border-gray-700 p-8">
         <div className="flex items-start gap-4">
            <ShieldCheckIcon className="w-8 h-8 text-slate-400 flex-shrink-0" />
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Legal Disclaimer & Terms of Use</h3>
                
                <div className="text-sm text-slate-600 dark:text-gray-400 space-y-3 leading-relaxed text-justify">
                    <p>
                        <strong>Independent Educational Tool:</strong> NHA Study Aid Pro is an independent study resource developed to assist candidates in preparing for certification examinations. This application and its developers are <strong>NOT</strong> affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with the <strong>National Healthcareer Association (NHA)</strong>, Assessment Technologies Institute (ATI), or any of their subsidiaries or affiliates.
                    </p>
                    <p>
                        <strong>Trademark Notice:</strong> The names "National Healthcareer Association," "NHA," "CCMA," "CPT," and "CET" are registered trademarks of their respective owners. The use of these trademarks within this application is for identification and reference purposes only and does not imply any association with the trademark holder.
                    </p>
                    <p>
                        <strong>Content Accuracy:</strong> While every effort has been made to ensure the accuracy and reliability of the information provided within this application, including flashcards, practice questions, and study guides, the developers make no representation or warranty, express or implied, regarding the accuracy, completeness, or suitability of the information. Medical standards and exam content outlines are subject to change. Users are encouraged to verify information against official NHA study materials and current clinical guidelines.
                    </p>
                    <p>
                        <strong>No Guarantee of Results:</strong> Use of this application does not guarantee a passing score on any NHA certification exam. This tool is intended to supplement, not replace, formal education and official study resources.
                    </p>
                    <p>
                        <strong>Limitation of Liability:</strong> Under no circumstances shall the developers be liable for any direct, indirect, incidental, special, or consequential damages arising out of the use of or inability to use this application, including but not limited to exam failure or reliance on information provided herein.
                    </p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default Profile;
