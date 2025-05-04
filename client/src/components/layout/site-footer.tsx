import { Link } from "wouter";
import { Code } from "lucide-react";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaGithub, 
  FaYoutube 
} from "react-icons/fa";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { title: "About", href: "/about" },
    { title: "Courses", href: "/r" },
    { title: "Blog", href: "/blog" },
    { title: "Contact", href: "/contact" },
    { title: "Terms", href: "/terms" },
    { title: "Privacy", href: "/privacy" },
  ];
  
  const socialLinks = [
    { icon: <FaFacebook />, label: "Facebook", href: "#" },
    { icon: <FaInstagram />, label: "Instagram", href: "#" },
    { icon: <FaTwitter />, label: "Twitter", href: "#" },
    { icon: <FaGithub />, label: "GitHub", href: "#" },
    { icon: <FaYoutube />, label: "YouTube", href: "#" },
  ];
  
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <a className="flex items-center">
              <Code className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-bold">Unlocked Coding</span>
            </a>
          </Link>
        </div>
        
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {footerLinks.map((link) => (
            <div key={link.title} className="px-5 py-2">
              <Link href={link.href}>
                <a className="text-base text-muted-foreground hover:text-foreground">
                  {link.title}
                </a>
              </Link>
            </div>
          ))}
        </nav>
        
        <div className="mt-8 flex justify-center space-x-6">
          {socialLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              className="text-muted-foreground hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{link.label}</span>
              <div className="text-xl">{link.icon}</div>
            </a>
          ))}
        </div>
        
        <p className="mt-8 text-center text-base text-muted-foreground">
          &copy; {currentYear} Unlocked Coding. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
