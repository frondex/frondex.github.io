import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, TrendingUp, BarChart3, Brain } from "lucide-react";

const InteractiveDemo = () => {
  const [query, setQuery] = useState("");
  
  const exampleQueries = [
    "Analyze Series A trends in fintech",
    "Compare PE valuations in healthcare",
    "Show me growth equity opportunities",
    "What are the latest fund performance metrics?"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Demo functionality - would integrate with actual API
      console.log("Demo query:", query);
    }
  };

  return (
    <section className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Ask anything about private markets
          </h2>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get instant insights powered by comprehensive market data and advanced AI analysis
          </p>
          
          {/* Interactive Input */}
          <div className="frondex-input max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about market trends, valuations, fund performance..."
                  className="border-0 bg-transparent text-lg py-6 pr-14 focus-visible:ring-0"
                />
              </div>
              
              <Button 
                type="submit" 
                size="icon" 
                className="btn-gradient rounded-xl h-12 w-12 shrink-0"
                disabled={!query.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
          
          {/* Example Queries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto mb-16">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-left p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all duration-300 group"
              >
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {example}
                </span>
              </button>
            ))}
          </div>
          
          {/* Demo Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">AI Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Advanced algorithms analyze market patterns and predict trends
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Data</h3>
              <p className="text-sm text-muted-foreground">
                Live market data and instant updates on portfolio performance
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Deep Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive reporting and risk assessment tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;