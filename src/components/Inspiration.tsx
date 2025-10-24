import React from 'react';
import { ArrowRight } from 'lucide-react';
import founderImg from '../assets/founder.jpg';
import kissImg from '../assets/kiss.jpg';
import kimsImg from '../assets/kims.jpg';
import aogImg from '../assets/aog.jpg';

interface InspirationCardProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const InspirationCard: React.FC<InspirationCardProps> = ({ title, description, imageUrl, link }) => {
  return (
    <div className="w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <img 
        src={imageUrl} 
        alt={title}
        className="w-full h-20 object-cover"
      />
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600 text-xs mb-2 leading-relaxed flex-1">{description}</p>
        
      </div>
    </div>
  );
};

const FounderCard: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col items-center">
      <div className="p-3 flex flex-col items-center flex-1 justify-center">
        <img 
          src={founderImg}
          alt="Prof. (Dr.) Achyuta Samanta"
          className="w-24 h-24 object-cover rounded-full shadow-lg border-4 border-blue-100 mb-2"
        />
        <h2 className="text-sm font-bold text-gray-900 text-center mb-1">
          Prof. (Dr.) Achyuta Samanta
        </h2>
        <p className="text-[10px] text-blue-600 font-semibold mb-2 text-center">
          Founder KIIT, KISS, KIMS & Art of Giving
        </p>
        <p className="text-gray-700 leading-relaxed text-[11px] text-center">
          Dr Achyuta Samanta is an educationalist, philanthropist, humanitarian, social worker, and writer. 
          He is the founder of KIIT & KISS, both educational institutions of global repute and recognition. 
        </p>
      </div>
    </div>
  );
};

const InspirationSection: React.FC = () => {
  const cards = [
    {
      title: "Educating the Marginalised",
      description: "KISS is the world's largest fully residential institution for tribal children. Founded with love and compassion, it empowers 80,000 lives with free education, food, and care.",
      imageUrl: kissImg,
      link: "#kiss"
    },
    {
      title: "Compassionate Healthcare",
      description: "KIMS is more than a hospital — it's a temple of healing. With cutting-edge technology and a human touch, KIMS serves thousands every day, rooted in service to all.",
      imageUrl: kimsImg,
      link: "#kims"
    },
    {
      title: "Art of Giving (AOG)",
      description: "AOG is global movement that promotes selfless service and spreading smiles. AOG encourages individuals to give—not just wealth, but time, empathy, and love.",
      imageUrl: aogImg,
      link: "#aog"
    }
  ];

  return (
    <div className="w-full py-8 flex items-center justify-center bg-gradient-to-br from-campus-blue/10 to-kiit-green/10 pl-4 ">
        <div className="heading">
            <h2 className=" text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-poppins font-bold text-gradient mb-4 sm:mb-6">
            Our Inspiration
          </h2>
        </div>
      <div className="w-full mx-auto ">
        <section className="w-full h-auto max-h-96 px-4 py-4 ">
          {/* All Cards in One Row (use full viewport width) */}
          <div className="w-full h-full grid grid-cols-4 gap-4 md:gap-6 lg:gap-8 items-stretch">
            {cards.map((card, index) => (
              <InspirationCard key={index} {...card} />
            ))}
            <FounderCard />
          </div>
        </section>
      </div>
    </div>
  );
};

export default InspirationSection;