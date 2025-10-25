import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to automatically link users to groups based on their roll number
 * Runs when user logs in and checks if their roll number matches any group members
 */
export function useGroupAutoLink() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.email) return;

    const checkAndLinkGroups = async () => {
      try {
        // Extract roll number from email (e.g., 24155637@kiit.ac.in -> 24155637)
        const rollNumberMatch = user.email.match(/^(\d+)@/);
        if (!rollNumberMatch) return;

        const rollNumber = rollNumberMatch[1];

        // Find groups where this roll number is listed as a member
        const { data: matchingMembers, error: membersError } = await supabase
          .from('group_members')
          .select(`
            id,
            name,
            roll_number,
            group_id,
            groups!inner(
              id,
              name,
              created_by,
              profiles!groups_created_by_fkey(
                full_name,
                email
              )
            )
          `)
          .eq('roll_number', rollNumber);

        if (membersError) {
          console.error('Error fetching matching members:', membersError);
          return;
        }

        if (!matchingMembers || matchingMembers.length === 0) return;

        // Check which groups haven't been notified yet
        for (const member of matchingMembers) {
          const group = member.groups as any;
          
          // Skip if user created this group
          if (group.created_by === user.id) continue;

          // Check if we've already notified about this group
          const { data: existingNotification } = await supabase
            .from('group_notifications')
            .select('id')
            .eq('user_id', user.id)
            .eq('group_id', group.id)
            .single();

          if (existingNotification) continue;

          // Record this notification
          await supabase
            .from('group_notifications')
            .insert({
              user_id: user.id,
              group_id: group.id
            });

          // Extract creator info
          const creatorProfile = group.profiles as any;
          const creatorName = creatorProfile?.full_name || 'Unknown';
          const creatorEmail = creatorProfile?.email || '';
          const creatorRollNumber = creatorEmail.match(/^(\d+)@/)?.[1] || '';

          // Show toast notification
          toast({
            title: `🎉 You've been added to a group!`,
            description: `Group: "${group.name}" • Added by: ${creatorName}${creatorRollNumber ? ` (${creatorRollNumber})` : ''} • Your roll number: ${rollNumber}`,
            duration: 6000,
            className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none",
          });
        }
      } catch (error) {
        console.error('Error in auto-link groups:', error);
      }
    };

    // Run check after a short delay to ensure everything is loaded
    const timeoutId = setTimeout(checkAndLinkGroups, 1000);

    return () => clearTimeout(timeoutId);
  }, [user, toast]);
}
