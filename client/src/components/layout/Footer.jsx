// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Car, Globe, MessageCircle, ExternalLink } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">RentiGo</span>
          </div>
          <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
            The modern vehicle rental platform. Find, book, and enjoy your perfect vehicle with just a few clicks.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {[Globe, MessageCircle, ExternalLink].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-300 mb-4">Platform</h4>
          <ul className="space-y-2">
            {[['Browse Vehicles', '/vehicles'], ['How It Works', '#'], ['Pricing', '#'], ['Become an Owner', '/register']].map(([l, to]) => (
              <li key={l}><Link to={to} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-300 mb-4">Company</h4>
          <ul className="space-y-2">
            {[['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Contact', '#']].map(([l, to]) => (
              <li key={l}><Link to={to} className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">© 2024 RentiGo. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="#" className="text-xs text-zinc-500 hover:text-zinc-300">Privacy Policy</Link>
          <Link to="#" className="text-xs text-zinc-500 hover:text-zinc-300">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
