import React from "react";
import { Mail, Phone, Linkedin, Twitter, Facebook, MapPin,Instagram } from "lucide-react";
import logo from "../../media/acme_logo.png"; // adjust path if needed

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f2847] text-gray-800 relative  py-12 pt-25">
      <div className="mx-auto px-30 grid md:grid-cols-3 gap-10 text-white">
        
        {/* Left Section - Logo & Contact Info */}
        <div>
          <div className="flex absolute left-30 top-0 items-center gap-3">
            <img src={logo} alt="ACME Global Logo" className="w-45 h-30 rounded-md object-contain" />
            {/* <h2 className="text-3xl font-bold tracking-wide">ACME Global</h2> */}
          </div>
          <p className="flex items-start gap-2 mb-3 text-base ">
            <MapPin size={18} className="mt-1 text-white" />
            504 & 506, 4th Floor, KTC Illumination,<br />
            HITEC City, Madhapur, Hyderabad,<br />
            Telangana 500081, India
          </p>
          <p className="flex items-center gap-2 text-base mb-1"><Mail size={18} /> support@acmeglobal.tech</p>
          <p className="flex items-center gap-2 text-base mb-1"><Phone size={18} /> +91 4040117942</p>
          <p className="flex items-center gap-2 text-base mb-1"><Phone size={18} /> +973 77996640 / +973 33601101</p>
          <p className="flex items-center gap-2 text-base"><Phone size={18} /> +965 98839566</p>
        </div>

        {/* Middle Section - Presence */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Our Presence in India</h3>
          <p className="text-base mb-6"> <a href="https://acmeglobal.tech/contact" className="hover:text-indigo-600 transition">ACME Global in Hyderabad</a></p>

          <h3 className="text-xl font-semibold mb-4">Our Global Presence</h3>
          <ul className="text-base space-y-2">
            <li><a href="https://acme.tech/contact" className="hover:text-indigo-600 transition">Almoayyed Computers Middle East, Bahrain</a> </li>
            <li> <a href="http://www.alghanimalmoayyed.tech/contact" className="hover:text-indigo-600 transition">Alghanim Almoayyed Computer Solutions, Kuwait</a> </li>
          </ul>
        </div>

        {/* Right Section - Socials */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
          <p className="text-base mb-5">
            For any inquiries, reach out to us via email or connect through our social media channels.
          </p>
          <div className="flex space-x-5 mt-2">
            <a href="https://in.linkedin.com/company/acme-global-hub-in" aria-label="LinkedIn" target="_blank" className="hover:text-indigo-600 transition">
              <Linkedin size={26} />
            </a>
             <a href="https://www.instagram.com/almoayyedcomputers/?hl=en" target="_blank" aria-label="LinkedIn" className="hover:text-indigo-600 transition"> 
                         <Instagram size={26} />
            </a>
            <a href="https://www.facebook.com/almoayyedcomputers" target="_blank" aria-label="Facebook" className="hover:text-indigo-600 transition">
            
              <Facebook size={26} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-12 border-t border-gray-300 pt-5 text-center text-base text-white">
        © {new Date().getFullYear()} ACME Global. All rights reserved.
      </div>
    </footer>
  );
}
