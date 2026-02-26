
import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#050814] border-t border-electric-purple/20 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <span className="text-2xl font-bold text-electric-purple neon-glow-purple">EKHO</span>
            <p className="mt-4 text-gray-400">
              Adaptez vos vidéos pour de nouveaux marchés. Même message, nouvelle langue, nouvelle audience.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-electric-purple transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/demos" className="text-gray-400 hover:text-electric-purple transition-colors">
                  Démos
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-electric-purple transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-electric-purple transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-electric-purple transition-colors">
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail size={18} className="text-electric-purple" />
                <span>contact@ekho-studio.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone size={18} className="text-electric-purple" />
                <span>+33 X XX XX XX XX</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-electric-purple transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-electric-purple transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-electric-purple transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-electric-purple/20 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EKHO Studio. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
