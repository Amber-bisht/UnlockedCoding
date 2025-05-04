import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyIcon, Heart, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DonatePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bitcoin");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} address has been copied`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Support Our Mission
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Help us continue providing quality coding education by donating cryptocurrency.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Heart className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-center">Why Donate?</CardTitle>
              <CardDescription className="text-center">
                Your contributions help us build a better learning platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>
                  At Unlocked Coding, we're committed to making quality programming education accessible to everyone. 
                  Your donations help us:
                </p>
                <ul>
                  <li>Create new and updated course content</li>
                  <li>Maintain our learning platform</li>
                  <li>Provide scholarships to students in need</li>
                  <li>Improve our technology infrastructure</li>
                  <li>Support open-source projects and community initiatives</li>
                </ul>
                <p>
                  We accept cryptocurrency donations to minimize transaction fees and ensure maximum value from your contribution.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/30 rounded-lg p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Donate with Cryptocurrency</h2>
              <p className="text-muted-foreground mt-2">
                We accept various cryptocurrencies for donations
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
                <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                <TabsTrigger value="other">Other Coins</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bitcoin" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bitcoin (BTC)</CardTitle>
                    <CardDescription>
                      The original cryptocurrency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-card border rounded-md">
                      <p className="font-mono text-sm break-all">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => copyToClipboard("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "Bitcoin")}>
                        <CopyIcon className="h-4 w-4 mr-2" />
                        Copy Address
                      </Button>
                    </div>
                    
                    <div className="mt-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mr-2 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Please double-check the address before sending any funds. Cryptocurrency transactions are irreversible.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ethereum" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ethereum (ETH)</CardTitle>
                    <CardDescription>
                      The leading smart contract platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-card border rounded-md">
                      <p className="font-mono text-sm break-all">0x1234567890123456789012345678901234567890</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => copyToClipboard("0x1234567890123456789012345678901234567890", "Ethereum")}>
                        <CopyIcon className="h-4 w-4 mr-2" />
                        Copy Address
                      </Button>
                    </div>
                    
                    <div className="mt-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mr-2 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        We accept Ethereum on both mainnet and layer 2 solutions like Arbitrum and Optimism.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="other" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Other Cryptocurrencies</CardTitle>
                    <CardDescription>
                      We accept additional cryptocurrencies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Solana (SOL)</h3>
                        <div className="p-4 bg-card border rounded-md">
                          <p className="font-mono text-sm break-all">HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe5tTAx</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => copyToClipboard("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe5tTAx", "Solana")}>
                            <CopyIcon className="h-4 w-4 mr-2" />
                            Copy Address
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-medium mb-2">Cardano (ADA)</h3>
                        <div className="p-4 bg-card border rounded-md">
                          <p className="font-mono text-sm break-all">addr1qy8sfn8c0xd3a25kd5l3u6qszxlr3ssmsm6gm8njt4hzp073r603vcjqgfc3akgddkhm9fz47xkt6gvce8dy3thalj3spg73w9</p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => copyToClipboard("addr1qy8sfn8c0xd3a25kd5l3u6qszxlr3ssmsm6gm8njt4hzp073r603vcjqgfc3akgddkhm9fz47xkt6gvce8dy3thalj3spg73w9", "Cardano")}>
                            <CopyIcon className="h-4 w-4 mr-2" />
                            Copy Address
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-start">
                        <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mr-2 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          For other cryptocurrencies not listed here, please contact us at donations@unlockedcoding.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Other Ways to Support Us</h3>
            <p className="text-muted-foreground mb-6">
              If cryptocurrency donations aren't for you, there are other ways to help
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-bold mb-2">Spread the Word</h4>
                  <p className="text-muted-foreground">
                    Share our platform with friends, colleagues, and social media. Help us reach more learners!
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-bold mb-2">Become a Contributor</h4>
                  <p className="text-muted-foreground">
                    Join our community as a mentor, content creator, or technical reviewer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}