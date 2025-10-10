import React, { useState } from "react";
import { Linkedin, Instagram, Github } from "lucide-react";
import { teamData } from "@/data/team.js";
import { error } from "console";

interface TeamMember {
  id?: number;
  name: string;
  role?: string;
  Image?: string;
  LinkedIn?: string;
  Instagram?: string;
  Github?: string;
}

const TeamCard = ({ member }: { member: TeamMember }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="[perspective:1000px] h-80">
      <div
        className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500 ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        {/* FRONT FACE */}
        <div className="hover:cursor-pointer hover:kiit-green-soft absolute inset-0 [backface-visibility:hidden] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg">
          <div className="flex flex-col items-center justify-center h-full p-6">
            {/* Image */}
            <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 bg-gray-200">
              {!imageError && member.Image ? (
                <img
                  src={member.Image}
                  alt={member.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400">
                  <span className="text-white text-4xl font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Member info */}
            <h3 className="text-xl font-semibold text-gray-800 text-center">
              {member.name}
            </h3>
            {/* {member.role && (
              <p className="text-semibold text-green-600 text-center mt-1">
                {member.role}
              </p>
            )} */}
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-kiit-green-light overflow-hidden  shadow-lg shadow-kiit-green-dark
">
          <div className="flex flex-col items-center justify-center h-full p-6 text-white">
            <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 bg-gray-200">
              {!imageError && member.Image ? (
                <img
                  src={member.Image}
                  alt={member.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover border border-gray-300 rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400">
                  <span className="text-white text-4xl font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
            {member.role && (
              <p className="text-lg mb-6 opacity-90">{member.role}</p>
            )}
            
            {/* Social Icons */}
            <div className="flex space-x-6">
              {member.LinkedIn && (
                <a
                  href={member.LinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-125 transition-transform duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-8 h-8 text-white hover:text-blue-200" />
                </a>
              )}
              {member.Instagram && (
                <a
                  href={member.Instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-125 transition-transform duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-8 h-8 text-white hover:text-pink-200" />
                </a>
              )}
              
              {member.Github && (
                <a
                  href={member.Github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-125 transition-transform duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="w-8 h-8 text-white hover:text-gray-200" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MeetOurTeam: React.FC = () => {
  const teamMembers: TeamMember[] = teamData;

  const rows = [
    teamMembers.slice(0, 4),
    teamMembers.slice(4, 8),
    teamMembers.slice(8, 12),
    teamMembers.slice(12, 16),
    teamMembers.slice(16, 17),
  ];

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Meet Our Team          </h2>
            <p className="text-muted-foreground text-lg italic">
              Helping you connect with the best.
            </p>
          </div>
        </div>

          {/* Team Grid */}
          <div className="space-y-8">
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`grid gap-6 ${rowIndex === 4
                    ? "grid-cols-1 max-w-xs mx-auto"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  }`}
              >
                {row.map((member, index) => (
                  <TeamCard key={index} member={member} />
                ))}
              </div>
            ))}
          </div>
        </div>
    </section>
  );
};

export default MeetOurTeam;