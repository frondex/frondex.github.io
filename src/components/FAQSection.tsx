import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Frondex's AI analysis work?",
    answer: "Our proprietary AI algorithms analyze vast amounts of market data, including fund performance, portfolio companies, deal terms, and market trends. The system uses machine learning to identify patterns and generate actionable insights for investment decisions."
  },
  {
    question: "What data sources does Frondex integrate with?",
    answer: "Frondex connects with leading data providers, fund administrators, and market intelligence platforms. We integrate with PitchBook, Preqin, Cambridge Associates, and over 50 other data sources to provide comprehensive market coverage."
  },
  {
    question: "Is my data secure on the Frondex platform?",
    answer: "Yes, security is our top priority. We employ bank-grade encryption, SOC 2 compliance, and multi-factor authentication. All data is encrypted both in transit and at rest, and we maintain strict access controls and audit trails."
  },
  {
    question: "Can Frondex integrate with our existing systems?",
    answer: "Absolutely. Frondex offers robust APIs and pre-built integrations with popular fund management systems, CRMs, and accounting platforms. Our technical team works closely with clients to ensure seamless integration."
  },
  {
    question: "What types of private market strategies does Frondex support?",
    answer: "Frondex supports all major private market strategies including private equity, venture capital, growth equity, private credit, real estate, and infrastructure. Our platform is flexible and can be customized for specific investment focuses."
  },
  {
    question: "How quickly can we get started with Frondex?",
    answer: "Implementation typically takes 2-4 weeks depending on your specific requirements and integrations. We provide dedicated onboarding support and training to ensure your team is productive from day one."
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Frondex and how it can transform 
              your private markets operations
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 py-2 shadow-soft"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;