import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to automatically link users to groups based on their roll number.
 * Matches user's roll number with group_members entries and updates them with user's email.
 */
export function useGroupAutoLink() {
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.email || !session?.access_token) return;

    const autoLinkGroups = async () => {
      try {
        // Extract roll number from email (assuming KIIT email format: rollnumber@kiit.ac.in)
        const emailMatch = user.email.match(/^(\d+)@/);
        if (!emailMatch) {
          console.log('No roll number found in email');
          return;
        }

        const userRollNumber = emailMatch[1];

        // Find all group_members with matching roll number but without this user's email
        const { data: matchingMembers, error: fetchError } = await supabase
          .from('group_members')
          .select(`
            id,
            group_id,
            roll_number,
            name,
            email_phone,
            groups:group_id (
              id,
              name,
              created_by,
              profiles:created_by (
                email
              )
            )
          `)
          .eq('roll_number', userRollNumber)
          .neq('email_phone', user.email);

        if (fetchError) {
          console.error('Error fetching matching members:', fetchError);
          return;
        }

        if (!matchingMembers || matchingMembers.length === 0) {
          console.log('No matching groups found for roll number:', userRollNumber);
          return;
        }

        // Update each matching member record with user's email
        const updates = matchingMembers.map(async (member: any) => {
          const { error: updateError } = await supabase
            .from('group_members')
            .update({ email_phone: user.email })
            .eq('id', member.id);

          if (updateError) {
            console.error('Error updating member:', updateError);
            return null;
          }

          return {
            name: member.groups?.name || 'Unknown Group',
            rollNumber: member.roll_number,
            creatorEmail: member.groups?.profiles?.email || 'Unknown'
          };
        });

        const results = await Promise.all(updates);
        const successfulLinks = results.filter(r => r !== null);

        // Show notifications for newly linked groups
        successfulLinks.forEach((group: any) => {
          toast({
            title: `🎉 You've been added to a group!`,
            description: `Group: "${group.name}" • Roll number: ${group.rollNumber}`,
            duration: 6000,
            className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none"
          });
        });

      } catch (error) {
        console.error('Error during group auto-link:', error);
      }
    };

    const timeoutId = setTimeout(autoLinkGroups, 1000);
    return () => clearTimeout(timeoutId);
  }, [user, session, toast]);
}
