import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllBillRecords, loadBillRecords, StoredBillRecord } from "@/lib/billStore";
import logo from "@/assets/sps-logo.png";

const BillRecords = () => {
  const navigate = useNavigate();
  const [billRecords, setBillRecords] = useState<StoredBillRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  useEffect(() => {
    // Load bill records
    loadBillRecords();
    setBillRecords(getAllBillRecords());
    
    // Listen for new bills being added
    const handleBillsUpdated = () => {
      setBillRecords(getAllBillRecords());
    };
    
    window.addEventListener('billsUpdated', handleBillsUpdated);
    
    return () => {
      window.removeEventListener('billsUpdated', handleBillsUpdated);
    };
  }, []);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = billRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(billRecords.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/settings")}
              className="hover:scale-105 transition-transform"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={logo} alt="SPS Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                📋 SPS Bill Records
              </h1>
              <p className="text-sm text-muted-foreground">View all saved bills</p>
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              All Bill Records ({billRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {billRecords.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Receipt className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">No bill records saved yet</p>
                <p className="text-sm">Bills will appear here after PDF download</p>
              </div>
            ) : (
              <div>
                {/* Table for larger screens */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Bill No</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Payment Mode</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((record, index) => (
                        <tr 
                          key={`${record.billNo}-${index}`}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium text-primary">{record.billNo}</td>
                          <td className="py-4 px-4">{record.date}</td>
                          <td className="py-4 px-4">{record.paymentMode}</td>
                          <td className="py-4 px-4 text-right font-semibold text-lg">₹{record.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards for mobile screens */}
                <div className="md:hidden space-y-4">
                  {currentRecords.map((record, index) => (
                    <div 
                      key={`${record.billNo}-${index}`}
                      className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-lg text-primary">{record.billNo}</span>
                        <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">{record.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">{record.paymentMode}</span>
                        <span className="font-bold text-xl text-primary">₹{record.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillRecords;
