
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

const Footer: React.FC = () => {
  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Find Mentors', path: '/mentors' },
        { name: 'Group Sessions', path: '/group-sessions' },
        { name: 'Success Stories', path: '/success-stories' },
        { name: 'Pricing', path: '/pricing' },
      ],
    },
    {
      title: 'For Mentors',
      links: [
        { name: 'Become a Mentor', path: '/become-mentor' },
        { name: 'Mentor Dashboard', path: '/mentor-dashboard' },
        { name: 'Resources', path: '/mentor-resources' },
        { name: 'Compensation', path: '/mentor-compensation' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Blog', path: '/blog' },
        { name: 'Careers', path: '/careers' },
        { name: 'Contact Us', path: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Cookie Policy', path: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="text-xl font-semibold text-primary">
              Mentor4All
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Connecting aspiring professionals with industry experts through personalized mentorship.
            </p>
            <div className="mt-6 flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="font-medium text-sm text-foreground">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.path}>
                    <Link 
                      to={link.path} 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Mentor4All. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <select 
                className="bg-transparent text-sm text-muted-foreground border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
