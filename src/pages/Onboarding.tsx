import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useOnboardingTracking } from "@/hooks/useOnboardingTracking";
import { SignupSourceStep } from "@/components/onboarding/SignupSourceStep";
import { ArchetypeStep } from "@/components/onboarding/ArchetypeStep";
import { InvestorTrackRecordStep, Investment } from "@/components/onboarding/InvestorTrackRecordStep";
import { ProfileStep } from "@/components/onboarding/ProfileStep";
import { SkillsStep } from "@/components/onboarding/SkillsStep";
import { ProjectStep } from "@/components/onboarding/ProjectStep";
import { TutorialStep } from "@/components/onboarding/TutorialStep";
import { ConfirmationStep } from "@/components/onboarding/ConfirmationStep";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { isProfileComplete } from "@/lib/profileCompleteness";
import type { Archetype } from "@/types/archetype";

interface RoleData {
  role_name: string;
  role_description: string;
  required_archetype: Archetype | null;
  required_skills: string[];
  is_filled: boolean;
}

interface SelectedSkill {
  skillId: string;
  skillName: string;
  category: "tech" | "design" | "business" | "investor";
  proficiency: number;
}

// Generate suggested username from email or OAuth display name
const generateSuggestedUsername = (email: string, displayName?: string): string => {
  // Priority 1: Name from OAuth provider (Google, etc)
  if (displayName) {
    return displayName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s]/g, "")     // Remove special chars
      .trim()
      .replace(/\s+/g, "_")            // Spaces → underscores
      .slice(0, 20);                   // Max 20 chars
  }
  
  // Priority 2: Local part of email
  const localPart = email.split("@")[0];
  return localPart
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20);
};

// Validate username semantically
const isValidUsername = (name: string, t: (key: string) => string): { valid: boolean; reason?: string } => {
  // Minimum 3 characters
  if (name.length < 3) {
    return { valid: false, reason: t('onboarding.minUsernameLength') };
  }
  
  // Maximum 20 characters
  if (name.length > 20) {
    return { valid: false, reason: t('onboarding.maxUsernameLength') };
  }
  
  // Only letters, numbers and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return { valid: false, reason: t('onboarding.usernameInvalidChars') };
  }
  
  // Must start with letter
  if (!/^[a-zA-Z]/.test(name)) {
    return { valid: false, reason: t('onboarding.usernameMustStartWithLetter') };
  }
  
  // Keyboard smashing detector - many consecutive consonants
  const consonantSequence = name.toLowerCase().match(/[bcdfghjklmnpqrstvwxz]{4,}/);
  if (consonantSequence) {
    return { valid: false, reason: t('onboarding.usernameNotMeaningful') };
  }
  
  return { valid: true };
};

const Onboarding = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Onboarding analytics tracking
  const { 
    trackStepCompleted, 
    trackStepSkipped, 
    trackOnboardingCompleted, 
    getTimeRemaining 
  } = useOnboardingTracking(currentStep);
  
  // Step 0: Signup Source
  const [signupSource, setSignupSource] = useState("");
  const [signupSourceOther, setSignupSourceOther] = useState("");

  // Step 1: Archetype
  const [archetype, setArchetype] = useState<"BUILDER" | "SELLER" | "INVESTOR" | "STARTER" | null>(null);
  
  // Step 2: Profile
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState("");
  const [stats, setStats] = useState({ code: 50, design: 50, marketing: 50 });
  const [phone, setPhone] = useState("");
  const [phoneE164, setPhoneE164] = useState<string | undefined>();
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Step 3: Skills
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  
  // Step for Investor: Track Record
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investorType, setInvestorType] = useState<string | null>(null);
  const [investorSectors, setInvestorSectors] = useState<string[]>([]);
  const [investorCheckRange, setInvestorCheckRange] = useState<string | null>(null);
  
  // Step 4: Project (optional)
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectRoles, setProjectRoles] = useState<RoleData[]>([]);
  const [showRoleForm, setShowRoleForm] = useState(false);

  // Real-time username validation
  useEffect(() => {
    if (username.length > 0) {
      const validation = isValidUsername(username, t);
      setUsernameError(validation.valid ? undefined : validation.reason);
    } else {
      setUsernameError(undefined);
    }
  }, [username, t]);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Generate suggested username from user's email or OAuth name
    const userEmail = session.user.email || "";
    const displayName = session.user.user_metadata?.full_name || 
                        session.user.user_metadata?.name || "";
    
    const suggestedUsername = generateSuggestedUsername(userEmail, displayName);
    setUsername(suggestedUsername);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // Load existing skills
    const { data: existingSkills } = await supabase
      .from("user_skills")
      .select(`
        skill_id,
        proficiency_level,
        skills(id, name, category)
      `)
      .eq("user_id", session.user.id);

    if (existingSkills && existingSkills.length > 0) {
      setSelectedSkills(existingSkills.map(us => ({
        skillId: us.skill_id,
        skillName: (us.skills as any)?.name || '',
        category: (us.skills as any)?.category || 'tech',
        proficiency: us.proficiency_level,
      })));
    }

    // Always check for pending phone from signup (before profile check)
    // This handles the race condition where profile creation is async
    const pendingPhone = localStorage.getItem("pending_phone");
    if (pendingPhone) {
      setPhone(pendingPhone);
      setPhoneE164(pendingPhone);
      setIsPhoneValid(true);
      // Save immediately to profile (even if profile doesn't exist yet, upsert will work later)
      try {
        await supabase.from("profiles").update({ phone: pendingPhone }).eq("id", session.user.id);
        console.log("Pending phone saved to profile:", pendingPhone);
      } catch (e) {
        console.warn("Could not save pending phone immediately, will save on profile step");
      }
      localStorage.removeItem("pending_phone");
    }

    if (profile) {
      // Load existing profile data for returning users
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
      if (profile.bio) {
        setBio(profile.bio);
      }
      if (profile.archetype) {
        setArchetype(profile.archetype as "BUILDER" | "SELLER");
      }
      if (profile.username) {
        setUsername(profile.username);
      }
      // Only load phone from profile if we don't have a pending phone (which takes priority)
      if (profile.phone && !pendingPhone) {
        setPhone(profile.phone);
        setPhoneE164(profile.phone);
        setIsPhoneValid(true);
      }
      if (profile.stats) {
        const statsData = profile.stats as { code?: number; design?: number; marketing?: number };
        // Only load stats if they are NOT the default 0,0,0 (set by database trigger)
        // This ensures new users start with 50,50,50 sliders instead of 0,0,0
        const isDefaultStats = statsData.code === 0 && statsData.design === 0 && statsData.marketing === 0;
        if (!isDefaultStats && (statsData.code !== undefined || statsData.design !== undefined || statsData.marketing !== undefined)) {
          setStats({
            code: statsData.code ?? 50,
            design: statsData.design ?? 50,
            marketing: statsData.marketing ?? 50,
          });
        }
      }
      if (profile.signup_source) {
        setSignupSource(profile.signup_source);
      }
      if (profile.signup_source_other) {
        setSignupSourceOther(profile.signup_source_other);
      }

      // Use centralized profile completeness check
      if (isProfileComplete(profile)) {
        // All users go to tavern - investors are now shown there
        navigate("/tavern");
      }
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return avatarUrl;

    try {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      return null;
    }
  };

  // Dynamic step logic based on archetype
  const isInvestor = archetype === "INVESTOR";
  
  // Steps mapping:
  // For Builder/Seller: 0=SignupSource, 1=Archetype, 2=Profile, 3=Skills, 4=Project, 5=Tutorial, 6=Confirmation
  // For Investor: 0=SignupSource, 1=Archetype, 2=TrackRecord, 3=Profile, 4=Skills, 5=Tutorial, 6=Confirmation
  const getActualStep = (stepIndex: number): string => {
    if (!isInvestor) {
      const steps = ["signup", "archetype", "profile", "skills", "project", "tutorial", "confirmation"];
      return steps[stepIndex] || "confirmation";
    } else {
      const steps = ["signup", "archetype", "trackRecord", "profile", "skills", "tutorial", "confirmation"];
      return steps[stepIndex] || "confirmation";
    }
  };

  const actualStep = useMemo(() => getActualStep(currentStep), [currentStep, isInvestor]);

  const validateStep = () => {
    if (actualStep === "signup" && !signupSource) {
      toast.error(t('signupSurvey.required'));
      return false;
    }
    if (actualStep === "signup" && signupSource === 'other' && !signupSourceOther.trim()) {
      toast.error(t('signupSurvey.otherRequired'));
      return false;
    }
    if (actualStep === "archetype" && !archetype) {
      toast.error(t('onboarding.selectArchetype'));
      return false;
    }
    // Investor track record validation - rigorous
    if (actualStep === "trackRecord") {
      // Must have investor type
      if (!investorType) {
        toast.error(t('investor.trackRecord.typeRequired', 'Selecione seu perfil de investidor'));
        return false;
      }
      // Must have at least 1 sector
      if (investorSectors.length === 0) {
        toast.error(t('investor.trackRecord.sectorsRequired', 'Selecione pelo menos 1 setor de interesse'));
        return false;
      }
      // Must have check range
      if (!investorCheckRange) {
        toast.error(t('investor.trackRecord.checkRangeRequired', 'Selecione seu range de cheque'));
        return false;
      }
      // Must have at least 1 valid investment with valid URL
      const validInvestments = investments.filter((inv) => {
        const hasValidName = inv.startupName.trim().length >= 2;
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/[\w\-./?%&=]*)?$/i;
        const hasValidUrl = urlPattern.test(inv.websiteUrl.trim());
        return hasValidName && hasValidUrl;
      });
      if (validInvestments.length < 1) {
        toast.error(t('investor.trackRecord.minimumRequired', 'Adicione pelo menos 1 startup com URL válida'));
        return false;
      }
    }
    if (actualStep === "profile") {
      const validation = isValidUsername(username, t);
      if (!validation.valid) {
        toast.error(validation.reason);
        return false;
      }
      // Phone agora é coletado no Auth, então não validamos aqui
      // Bio e Avatar agora são opcionais para reduzir fricção
    }
    return true;
  };

  // Auto-populate looking_for and offering based on archetype (silent)
  const getLookingFor = (arch: Archetype) => {
    if (arch === "BUILDER") return "CMO / Growth / Comercial";
    if (arch === "INVESTOR") return "Startups early-stage / Founders";
    if (arch === "STARTER") return "Mentor / Co-founder / Oportunidade";
    return "CTO / Dev / Product";
  };

  const getOffering = (arch: Archetype) => {
    if (arch === "BUILDER") return "Desenvolvimento / Produto / Tech";
    if (arch === "INVESTOR") return "Capital / Mentoria / Network";
    if (arch === "STARTER") return "Dedicação / Aprendizado / Potencial";
    return "Marketing / Vendas / Growth";
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Save signup_source immediately to preserve data if user abandons
    if (actualStep === "signup") {
      setIsLoading(true);
      try {
        const { error } = await supabase.from("profiles").update({
          signup_source: signupSource,
          signup_source_other: signupSource === 'other' ? signupSourceOther.trim() : null,
        }).eq("id", session.user.id);

        if (error) throw error;
      } catch (error: any) {
        console.error("Failed to save signup source:", error);
        // Non-blocking: continue even if this fails
      } finally {
        setIsLoading(false);
      }
    }

    // Save archetype immediately to preserve data if user abandons
    if (actualStep === "archetype") {
      setIsLoading(true);
      try {
        const { error } = await supabase.from("profiles").update({
          archetype: archetype!,
        }).eq("id", session.user.id);

        if (error) throw error;
      } catch (error: any) {
        console.error("Failed to save archetype:", error);
        // Non-blocking: continue even if this fails
      } finally {
        setIsLoading(false);
      }
    }

    // Save investor track record and profile fields
    if (actualStep === "trackRecord" && investments.length >= 1) {
      setIsLoading(true);
      try {
        // Save investments
        const investmentsToSave = investments
          .filter((inv) => inv.startupName.trim() && inv.websiteUrl.trim())
          .map((inv) => ({
            investor_id: session.user.id,
            startup_name: inv.startupName,
            website_url: inv.websiteUrl,
          }));

        const { error: investError } = await supabase.from("investments").insert(investmentsToSave);
        if (investError) throw investError;

        // Update profile with investor-specific fields
        const { error: profileError } = await supabase.from("profiles").update({
          investor_type: investorType,
          investor_sectors: investorSectors,
          investor_check_range: investorCheckRange,
        }).eq("id", session.user.id);
        
        if (profileError) throw profileError;
      } catch (error: any) {
        console.error("Failed to save investments:", error);
        toast.error(t('investor.trackRecord.saveError', 'Erro ao salvar investimentos'));
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Save full profile with auto-populated looking_for/offering
    if (actualStep === "profile") {
      setIsLoading(true);
      try {
        // Upload avatar primeiro
        const uploadedAvatarUrl = await uploadAvatar(session.user.id);

        // Fallback: check localStorage again in case pendingPhone wasn't applied
        let phoneToSave = phoneE164;
        if (!phoneToSave) {
          const lastChancePhone = localStorage.getItem("pending_phone");
          if (lastChancePhone) {
            phoneToSave = lastChancePhone;
            localStorage.removeItem("pending_phone");
          }
        }

        const { error } = await supabase.from("profiles").upsert({
          id: session.user.id,
          username,
          archetype: archetype!,
          bio,
          stats,
          phone: phoneToSave,
          avatar_url: uploadedAvatarUrl,
          looking_for: getLookingFor(archetype!),
          offering: getOffering(archetype!),
          signup_source: signupSource,
          signup_source_other: signupSource === 'other' ? signupSourceOther.trim() : null,
        });

        if (error) throw error;
      } catch (error: any) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Save skills with upsert
    if (actualStep === "skills" && selectedSkills.length > 0) {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");

        const selectedSkillIds = selectedSkills.map(s => s.skillId);

        // Delete skills that are no longer selected
        await supabase
          .from("user_skills")
          .delete()
          .eq("user_id", session.user.id)
          .not("skill_id", "in", `(${selectedSkillIds.join(",")})`);

        // Upsert selected skills
        const skillsToUpsert = selectedSkills.map(skill => ({
          user_id: session.user.id,
          skill_id: skill.skillId,
          proficiency_level: skill.proficiency,
        }));

        const { error } = await supabase
          .from("user_skills")
          .upsert(skillsToUpsert, { onConflict: "user_id,skill_id" });

        if (error) throw error;
      } catch (error: any) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Save project if created (only for non-investors)
    if (actualStep === "project" && projectTitle.trim()) {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");

        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert({
            owner_id: session.user.id,
            title: projectTitle,
            description: projectDescription,
            status: "IDEA",
            is_recruiting: projectRoles.length > 0,
          })
          .select()
          .single();

        if (projectError) throw projectError;

        if (projectRoles.length > 0 && project) {
          const rolesWithProjectId = projectRoles.map(role => ({
            ...role,
            project_id: project.id,
          }));

          const { error: rolesError } = await supabase
            .from("project_roles")
            .insert(rolesWithProjectId);

          if (rolesError) throw rolesError;
        }

        toast.success(t('onboarding.projectCreated'));
      } catch (error: any) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    // Show welcome modal then navigate
    if (actualStep === "confirmation") {
      trackOnboardingCompleted();
      
      // Mark as new user to trigger tour on first Tavern visit
      localStorage.setItem('guilda_is_new_user', 'true');
      
      // IMPORTANT: Ensure profile is complete before showing welcome modal
      // This prevents redirect loop when user clicks "Fazer Tour" and gets sent back to onboarding
      try {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('stats, looking_for, archetype')
          .eq('id', session.user.id)
          .single();
        
        if (currentProfile) {
          const statsData = currentProfile.stats as { code?: number; design?: number; marketing?: number } | null;
          const isDefaultStats = statsData?.code === 0 && statsData?.design === 0 && statsData?.marketing === 0;
          const hasLookingFor = !!currentProfile.looking_for;
          
          // If profile is incomplete, fill in default values
          if (isDefaultStats || !hasLookingFor) {
            const updateData: Record<string, unknown> = {};
            
            if (isDefaultStats && currentProfile.archetype !== 'INVESTOR') {
              // Set default balanced stats so profile passes completeness check
              updateData.stats = { code: 50, design: 50, marketing: 50 };
            }
            
            if (!hasLookingFor) {
              updateData.looking_for = getLookingFor(currentProfile.archetype || archetype!);
              updateData.offering = getOffering(currentProfile.archetype || archetype!);
            }
            
            if (Object.keys(updateData).length > 0) {
              await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', session.user.id);
            }
          }
        }
      } catch (error) {
        console.error('[Onboarding] Error ensuring profile completeness:', error);
        // Non-blocking: continue even if this fails
      }
      
      // Trigger automatic co-founder introductions in background (non-blocking)
      const triggerAutoIntroductions = async (attempt = 1) => {
        console.log(`[Onboarding] Triggering auto-introductions (attempt ${attempt})...`);
        
        try {
          const { data, error } = await supabase.functions.invoke('auto-introduce-cofounders');
          
          if (error) {
            console.error('[Onboarding] Auto-introduce error:', {
              attempt,
              error: error.message,
              details: error
            });
            
            // Retry once after 2 seconds if first attempt fails
            if (attempt === 1) {
              console.log('[Onboarding] Retrying auto-introductions in 2 seconds...');
              setTimeout(() => triggerAutoIntroductions(2), 2000);
            }
          } else {
            console.log('[Onboarding] Auto-introduce success:', {
              attempt,
              matchesCreated: data?.matchesCreated,
              result: data
            });
            
            // Track successful auto-introduction
            if (data?.matchesCreated > 0) {
              console.log(`[Onboarding] ✅ Created ${data.matchesCreated} automatic introductions`);
            }
          }
        } catch (err) {
          console.error('[Onboarding] Auto-introduce exception:', {
            attempt,
            error: err
          });
          
          // Retry once after 2 seconds if first attempt fails
          if (attempt === 1) {
            console.log('[Onboarding] Retrying auto-introductions in 2 seconds...');
            setTimeout(() => triggerAutoIntroductions(2), 2000);
          }
        }
      };
      
      triggerAutoIntroductions();
      
      setShowWelcomeModal(true);
      return;
    }

    // Track step completion before advancing
    trackStepCompleted(currentStep);
    setCurrentStep(currentStep + 1);
  };

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    navigate("/tavern");
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const skippableSteps = ["skills", "project", "tutorial"];
    if (skippableSteps.includes(actualStep)) {
      trackStepSkipped(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  // Determine if current step is skippable
  const canSkip = ["skills", "project", "tutorial"].includes(actualStep);

  return (
    <div className="h-screen pb-20 md:pb-0 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-48 h-48 sm:top-20 sm:left-20 sm:w-72 sm:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 sm:bottom-20 sm:right-20 sm:w-96 sm:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="glass max-w-4xl w-full p-4 sm:p-8 rounded-2xl relative z-10 max-h-[calc(100vh-32px)] overflow-y-auto">
        {/* Visual Progress Indicator */}
        <div className="mb-4 sm:mb-8">
          <OnboardingProgress 
            currentStep={currentStep} 
            timeRemaining={getTimeRemaining(currentStep)} 
          />
        </div>

        {/* Step Content */}
        {actualStep === "signup" && (
          <SignupSourceStep
            selectedSource={signupSource}
            setSelectedSource={setSignupSource}
            otherText={signupSourceOther}
            setOtherText={setSignupSourceOther}
          />
        )}

        {actualStep === "archetype" && (
          <ArchetypeStep archetype={archetype} setArchetype={setArchetype} />
        )}

        {actualStep === "trackRecord" && (
          <InvestorTrackRecordStep
            investments={investments}
            setInvestments={setInvestments}
            investorType={investorType}
            setInvestorType={setInvestorType}
            investorSectors={investorSectors}
            setInvestorSectors={setInvestorSectors}
            investorCheckRange={investorCheckRange}
            setInvestorCheckRange={setInvestorCheckRange}
          />
        )}

        {actualStep === "profile" && (
          <ProfileStep
            username={username}
            setUsername={setUsername}
            usernameError={usernameError}
            bio={bio}
            setBio={setBio}
            stats={stats}
            setStats={setStats}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            archetype={archetype}
          />
        )}

        {actualStep === "skills" && (
          <SkillsStep
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            archetype={archetype}
          />
        )}

        {actualStep === "project" && (
          <ProjectStep
            projectTitle={projectTitle}
            setProjectTitle={setProjectTitle}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            projectRoles={projectRoles}
            setProjectRoles={setProjectRoles}
            showRoleForm={showRoleForm}
            setShowRoleForm={setShowRoleForm}
          />
        )}

        {actualStep === "tutorial" && <TutorialStep />}

        {actualStep === "confirmation" && <ConfirmationStep />}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 sm:mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('onboarding.back')}
          </Button>

          <div className="flex gap-2">
            {canSkip && (
              <Button variant="outline" onClick={handleSkip}>
                {t('onboarding.skip')}
              </Button>
            )}
            
            <Button onClick={handleNext} disabled={isLoading}>
              {actualStep === "confirmation" ? t('onboarding.enterTavern') : t('onboarding.continue')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {archetype && (
        <WelcomeModal 
          open={showWelcomeModal} 
          onClose={handleWelcomeClose} 
          archetype={archetype} 
        />
      )}
    </div>
  );
};

export default Onboarding;