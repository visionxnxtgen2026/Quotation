import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

export default class ExportErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ExportErrorBoundary] Caught unhandled error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 max-w-md w-full text-center shadow-xl space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              An unexpected error occurred while loading the export page. You can reload the page or return to the dashboard.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (this.props.goBack) this.props.goBack();
                  else window.history.back();
                }}
                className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={16} /> Go Back
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={16} /> Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
