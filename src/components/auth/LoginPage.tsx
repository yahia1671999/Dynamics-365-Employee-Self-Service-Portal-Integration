import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { authService, RegisteredUser } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (cardId: string, user?: RegisteredUser) => void;
  defaultCardId?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  defaultCardId = '',
}) => {
  const [username, setUsername] = useState(() => defaultCardId || authService.getRememberedCardId() || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!authService.getRememberedCardId());
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().replace(/\s/g, '');

    // Execute authentication via the central Authentication Service and ASP.NET Core Web API
    setIsLoading(true);
    try {
      const authResult = await authService.loginAsync(cleanUsername, password, rememberMe);
      setIsLoading(false);

      if (!authResult.success) {
        setErrorMessage(authResult.errorMessage || 'اسم المستخدم أو كلمة المرور غير صحيحة');
        return;
      }

      onLoginSuccess(cleanUsername, authResult.user);
    } catch {
      setIsLoading(false);
      setErrorMessage('تعذر الاتصال بخدمة المصادقة في ASP.NET Core');
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col lg:flex-row overflow-x-hidden font-sans selection:bg-[#0078D4] selection:text-white"
      dir="rtl"
    >
      {/* =========================================================================
          RIGHT-SIDE VISUAL SECTION (in RTL displays on Right):
          Realistic high-res corporate office glass skyscraper,
          vivid, clear and executive with reduced overlay,
          prominent title, subtitle, and Microsoft Fluent feature icons.
          ========================================================================= */}
      <section className="relative w-full lg:w-[48%] min-h-[560px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white overflow-hidden shrink-0">
        {/* Realistic High-Res Corporate Glass Office Building Photograph with Enhanced Clarity */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Corporate Glass Office Skyscraper"
            className="w-full h-full object-cover object-center transform scale-105"
            style={{ filter: 'contrast(1.08) brightness(1.06) saturate(1.10)' }}
            loading="eager"
          />
          {/* Reduced, luminous navy gradient overlay - allows vivid building architecture and blue sky reflections to shine */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(8, 28, 58, 0.46) 0%, rgba(11, 46, 92, 0.26) 45%, rgba(14, 58, 115, 0.18) 75%, rgba(6, 22, 48, 0.50) 100%)',
            }}
          />
          {/* Localized text legibility vignette on the right (text side in RTL) */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                'radial-gradient(ellipse at 85% 50%, rgba(5, 18, 40, 0.45) 0%, rgba(5, 18, 40, 0.20) 50%, transparent 80%)',
            }}
          />
          {/* Subtle executive specular light highlight across the upper glass facade */}
          <div
            className="absolute -top-20 -right-20 w-[500px] h-[350px] -rotate-12 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse, rgba(0, 164, 239, 0.18) 0%, rgba(255, 255, 255, 0.10) 40%, transparent 70%)',
              filter: 'blur(45px)',
            }}
          />
        </div>

        {/* TOP: Microsoft Dynamics 365 Branding with Refined Glass Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-[0_4px_16px_rgba(0,10,30,0.25)]">
            {/* Official Microsoft 4-Color Squares Glyph */}
            <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0 drop-shadow-sm">
              <div className="bg-[#F25022] w-2.5 h-2.5 rounded-[1px]" />
              <div className="bg-[#7FBA00] w-2.5 h-2.5 rounded-[1px]" />
              <div className="bg-[#00A4EF] w-2.5 h-2.5 rounded-[1px]" />
              <div className="bg-[#FFB900] w-2.5 h-2.5 rounded-[1px]" />
            </div>
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[11px] text-white/95 font-medium tracking-wide drop-shadow-xs">Microsoft</span>
              <span className="text-base text-white font-bold tracking-tight drop-shadow-xs">Dynamics 365</span>
            </div>
          </div>
        </div>

        {/* CENTER-RIGHT: Prominent, High-Contrast Arabic Title & Subtitle */}
        <div className="relative z-10 my-auto py-8 max-w-xl text-right">
          {/* Dynamics Platform Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3.5 bg-white/18 backdrop-blur-md border border-white/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
            <span className="text-xs font-semibold text-white tracking-wide">نظام الموارد البشرية والخدمة الذاتية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-[1.22] drop-shadow-[0_2px_12px_rgba(0,10,30,0.7)]">
            بوابة الخدمة الذاتية للموظف
          </h1>
          <p className="mt-3.5 text-lg sm:text-xl font-semibold text-white/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,10,30,0.6)]">
            خدماتك.. في مكان واحد
          </p>
        </div>

        {/* BOTTOM: Three Horizontal Feature Icons in Microsoft Fluent Design */}
        <div className="relative z-10 pb-2">
          <div className="flex items-center justify-start gap-8 sm:gap-11">
            {/* 1. سهولة الوصول (Microsoft Fluent Person / Accessibility) */}
            <div className="flex flex-col items-center gap-2.5 group cursor-default">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_24px_-6px_rgba(0,120,212,0.5)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.12) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.65)',
                  boxShadow: '0 10px 24px -4px rgba(0, 15, 45, 0.35), inset 0 1px 2px 0 rgba(255, 255, 255, 0.85)',
                }}
              >
                {/* Official Fluent 24/Regular "Person / Fast Access" Icon */}
                <svg className="w-6 h-6 drop-shadow-md text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.9" />
                  <path d="M4 20C4 16.134 7.58172 13 12 13C16.4183 13 20 16.134 20 20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  {/* Subtle Fluent Accent Spark */}
                  <circle cx="17.5" cy="5.5" r="1.5" fill="#38BDF8" />
                </svg>
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,10,30,0.8)]">سهولة الوصول</span>
            </div>

            {/* 2. أمان وموثوقية (Microsoft Fluent Shield Keyhole / Security) */}
            <div className="flex flex-col items-center gap-2.5 group cursor-default">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_24px_-6px_rgba(16,185,129,0.5)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.12) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.65)',
                  boxShadow: '0 10px 24px -4px rgba(0, 15, 45, 0.35), inset 0 1px 2px 0 rgba(255, 255, 255, 0.85)',
                }}
              >
                {/* Official Fluent 24/Regular "Shield Check / Reliability" Icon */}
                <svg className="w-6 h-6 drop-shadow-md text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="1.9" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M9 11.5L11 13.5L15.5 9" 
                    stroke="currentColor" 
                    strokeWidth="1.9" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,10,30,0.8)]">أمان وموثوقية</span>
            </div>

            {/* 3. دعم مستمر (Microsoft Fluent Headset Support / Customer Care) */}
            <div className="flex flex-col items-center gap-2.5 group cursor-default">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_24px_-6px_rgba(245,158,11,0.5)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.12) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.65)',
                  boxShadow: '0 10px 24px -4px rgba(0, 15, 45, 0.35), inset 0 1px 2px 0 rgba(255, 255, 255, 0.85)',
                }}
              >
                {/* Official Fluent 24/Regular "Headset / Support" Icon */}
                <svg className="w-6 h-6 drop-shadow-md text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V17C21 18.6569 19.6569 20 18 20H17V15H19.5V12C19.5 7.85786 16.1421 4.5 12 4.5C7.85786 4.5 4.5 7.85786 4.5 12V15H7V20H6C4.34315 20 3 18.6569 3 17V12Z" 
                    stroke="currentColor" 
                    strokeWidth="1.9" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M17 19H12" 
                    stroke="currentColor" 
                    strokeWidth="1.9" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,10,30,0.8)]">دعم مستمر</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          LEFT-SIDE LOGIN SECTION (in RTL displays on Left):
          Calm, balanced executive frosted glass background with refined depth,
          subtle floating prisms, behind the centered glass login card with balanced lighting.
          ========================================================================= */}
      <section
        className="relative w-full lg:w-[52%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 70% 20%, #F5F8FA 0%, #ECF1F6 38%, #E2EAF1 72%, #D6DFE8 100%)',
        }}
      >
        {/* Layered Architectural Glass Prisms, Light Beams, Micro-Grid & Fluent Bokeh Orbs in the background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          {/* Subtle Enterprise Architectural Mesh / Dot Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="fluent-arch-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="rgba(0, 120, 212, 0.06)" strokeWidth="1" />
                <circle cx="44" cy="44" r="1" fill="rgba(0, 120, 212, 0.12)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fluent-arch-grid)" />
          </svg>

          {/* Diagonal Specular Ambient Light Beam across Upper Section */}
          <div
            className="absolute -top-32 -left-20 w-[900px] h-[340px] -rotate-[22deg] pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 100%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Soft Ambient Core 1 (Directly behind the cards - subtle depth without neon bloom) */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 120, 212, 0.10) 0%, rgba(0, 90, 180, 0.04) 45%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Glass Orb 1 (Top-Left behind card): Soft subtle blue glass ambient */}
          <div 
            className="absolute -top-16 -left-16 w-[420px] h-[420px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 120, 212, 0.08) 0%, rgba(0, 120, 212, 0.03) 50%, transparent 70%)',
              filter: 'blur(45px)',
            }}
          />

          {/* Glass Orb 2 (Center-Right behind card): Subtle soft blue illumination */}
          <div 
            className="absolute top-1/3 -right-20 w-[460px] h-[460px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 120, 212, 0.07) 0%, rgba(56, 189, 248, 0.04) 55%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Glass Orb 3 (Bottom-Left): Light subtle ambient */}
          <div 
            className="absolute -bottom-20 left-1/4 w-[380px] h-[380px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(147, 197, 253, 0.12) 0%, rgba(186, 230, 253, 0.04) 50%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Sculpted Frosted Glass Ribbon (Dynamics Flow - Upper-Left) */}
          <div
            className="absolute top-[14%] -left-32 w-[640px] h-[200px] -rotate-12 rounded-[52px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.10) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.70)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 20px 45px rgba(0, 30, 70, 0.06), 0 0 20px rgba(0, 120, 212, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
            }}
          />

          {/* Floating Subtle Frosted Glass Hexagon / Geometric Pill (Bottom-Right) */}
          <div
            className="absolute bottom-[6%] -right-16 w-[360px] h-[190px] rotate-[15deg] rounded-[46px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.08) 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 16px 36px rgba(0, 30, 70, 0.05), 0 0 18px rgba(0, 120, 212, 0.04), inset 0 1px 2px rgba(255, 255, 255, 0.80)',
            }}
          />
        </div>

        {/* Refined Enterprise Top Bar in Left-Side Section */}
        <div className="relative z-20 flex items-center justify-end gap-3 px-1 sm:px-2 pt-1 pb-2">
          {/* Microsoft Dynamics 365 Cloud Platform Tag */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#605E5C] shadow-[0_2px_8px_rgba(0,0,0,0.03)] select-none"
            style={{
              background: 'rgba(255, 255, 255, 0.60)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#0078D4]" />
            <span className="text-[11px] font-medium text-[#201F1E]">Dynamics 365 Core</span>
          </div>
        </div>

        {/* CENTERED: DUAL LAYERED ULTRA-GLASSMORPHIC LOGIN CARDS WITH BALANCED LIGHTING */}
        <div className="relative z-10 my-auto flex items-center justify-center w-full py-4 sm:py-6">
          <div className="relative w-full max-w-[490px] flex items-center justify-center">

            {/* ===================================================================
                THE CARD BEHIND IT (الكارت الذي خلفه):
                Frosted Glassmorphism with refined, soft corporate depth (without neon cyan glare)
                Layered behind the login card with subtle offset angle.
                =================================================================== */}
            <div
              className="absolute -inset-2.5 sm:-inset-4 rounded-[34px] pointer-events-none transition-all duration-500 transform rotate-[-1.5deg] sm:rotate-[-2deg] scale-[1.01] sm:scale-[1.02]"
              style={{
                /* Translucent Glass Gradient */
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.14) 50%, rgba(0, 120, 212, 0.07) 100%)',
                backdropFilter: 'blur(30px) saturate(140%)',
                WebkitBackdropFilter: 'blur(30px) saturate(140%)',
                /* Glowing Glass Border */
                border: '1.2px solid rgba(255, 255, 255, 0.65)',
                /* Soft, Refined Executive Shadow (without overwhelming cyan glare) */
                boxShadow: `
                  0 20px 50px -10px rgba(10, 30, 60, 0.12),
                  0 8px 24px -4px rgba(0, 120, 212, 0.08),
                  0 0 18px 1px rgba(0, 120, 212, 0.06),
                  inset 0 0 20px rgba(255, 255, 255, 0.35),
                  inset 0 1px 2px 0 rgba(255, 255, 255, 0.8)
                `,
              }}
            >
              {/* Back Card: Top Specular Light Beam on Glass Edge */}
              <div 
                className="absolute top-0 inset-x-8 h-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 40%, rgba(0, 120, 212, 0.40) 60%, transparent 100%)',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.6), 0 0 14px rgba(0, 120, 212, 0.25)',
                }}
              />

              {/* Back Card: Subtle Corner Accent Points */}
              <div 
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(0, 120, 212, 0.4) 50%, transparent 100%)',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(0, 120, 212, 0.35)',
                }}
              />
              <div 
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(0, 120, 212, 0.4) 50%, transparent 100%)',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 8px rgba(0, 120, 212, 0.35)',
                }}
              />

              {/* Back Card: Subtle Ambient Glow Core */}
              <div 
                className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 120, 212, 0.08) 0%, transparent 70%)',
                  filter: 'blur(22px)',
                }}
              />
            </div>

            {/* ===================================================================
                THE MAIN LOGIN CARD (كارت تسجيل الدخول):
                Preserved exact structure and elements, with balanced lighting
                =================================================================== */}
            <div
              className="relative z-20 w-full p-8 sm:p-10 rounded-[28px] overflow-hidden transition-all duration-300 text-[#323130] group hover:shadow-[0_24px_50px_rgba(0,35,80,0.16),0_0_25px_rgba(0,120,212,0.12)]"
              style={{
                /* Crystal Clear Translucent Glass Background */
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.28) 50%, rgba(255, 255, 255, 0.45) 100%)',
                backdropFilter: 'blur(40px) saturate(160%)',
                WebkitBackdropFilter: 'blur(40px) saturate(160%)',
                /* Glowing Crisp Glass Border */
                border: '1.5px solid rgba(255, 255, 255, 0.82)',
                /* Balanced Ambient Shadow & Soft Depth */
                boxShadow: `
                  0 0 16px 0 rgba(0, 120, 212, 0.08),
                  0 20px 50px -10px rgba(0, 35, 80, 0.14),
                  inset 0 1px 3px 0 rgba(255, 255, 255, 0.95),
                  inset 0 0 20px rgba(255, 255, 255, 0.30),
                  inset 0 -1px 2px 0 rgba(0, 120, 212, 0.12)
                `,
              }}
            >
              {/* Inner Subtle Light Orbs (Refined and balanced) */}
              <div 
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 120, 212, 0.08) 0%, rgba(0, 120, 212, 0.03) 45%, transparent 70%)',
                  filter: 'blur(22px)',
                }}
              />
              <div 
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 120, 212, 0.06) 0%, rgba(56, 189, 248, 0.03) 45%, transparent 70%)',
                  filter: 'blur(24px)',
                }}
              />

              {/* Specular Curved Light Reflection Streak across top glass edge */}
              <div 
                className="absolute -top-12 -left-12 -right-12 h-32 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
                  filter: 'blur(3px)',
                }}
              />

              {/* Top Glass Edge Light Streak with Glow */}
              <div 
                className="absolute top-0 inset-x-12 h-[1.5px] rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.95) 50%, transparent 100%)',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 0 12px rgba(0, 120, 212, 0.2)',
                }}
              />

              {/* Title & Subtitle inside Card */}
              <div className="text-center space-y-1 mb-8 relative z-10">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#0B2E59] tracking-tight drop-shadow-xs">
                  تسجيل الدخول
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#0078D4] tracking-wide flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A4EF] shadow-[0_0_8px_#00A4EF] inline-block" />
                  <span>بوابة الخدمة الذاتية للموظف</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A4EF] shadow-[0_0_8px_#00A4EF] inline-block" />
                </p>
              </div>

              {/* Error Message Alert with Glassmorphism */}
              {errorMessage && (
                <div 
                  className="mb-4 p-3 rounded-xl text-red-700 text-xs flex items-center gap-2 shadow-sm animate-shake relative z-10"
                  style={{
                    background: 'rgba(254, 242, 242, 0.92)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid rgba(252, 165, 165, 0.65)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4 relative z-10">
                {/* Field 1: اسم المستخدم */}
                <div className="space-y-1.5">
                  <label htmlFor="loginUsername" className="block text-right text-xs font-bold text-[#2A4365]">
                    اسم المستخدم
                  </label>
                  <div 
                    className="relative rounded-[14px] focus-within:ring-2 focus-within:ring-[#0078D4] focus-within:border-white transition-all duration-200 h-[50px] flex items-center px-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.52)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.85)',
                      boxShadow: '0 4px 15px rgba(0, 50, 110, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.85), 0 0 15px rgba(0, 120, 212, 0.08)',
                    }}
                  >
                    {/* User line icon on visual left */}
                    <User className="w-4 h-4 text-[#2A4365] shrink-0" aria-hidden="true" />
                    {/* Input field */}
                    <input
                      id="loginUsername"
                      type="text"
                      maxLength={14}
                      value={username}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setUsername(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="29897622655477"
                      className="flex-1 h-full bg-transparent border-none outline-none text-[#0B2E59] text-sm font-mono tracking-wider text-right pr-2 placeholder:text-slate-500 font-bold"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Field 2: كلمة المرور */}
                <div className="space-y-1.5">
                  <label htmlFor="loginPassword" className="block text-right text-xs font-bold text-[#2A4365]">
                    كلمة المرور
                  </label>
                  <div 
                    className="relative rounded-[14px] focus-within:ring-2 focus-within:ring-[#0078D4] focus-within:border-white transition-all duration-200 h-[50px] flex items-center px-4"
                    style={{
                      background: 'rgba(255, 255, 255, 0.52)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.85)',
                      boxShadow: '0 4px 15px rgba(0, 50, 110, 0.05), inset 0 1px 2px rgba(255, 255, 255, 0.85), 0 0 15px rgba(0, 120, 212, 0.08)',
                    }}
                  >
                    {/* Lock line icon on visual left */}
                    <Lock className="w-4 h-4 text-[#2A4365] shrink-0" aria-hidden="true" />

                    {/* Input field */}
                    <input
                      id="loginPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="••••••••••••"
                      className="flex-1 h-full bg-transparent border-none outline-none text-[#0B2E59] text-sm font-mono tracking-wider text-right px-2 placeholder:text-slate-500 font-bold"
                      autoComplete="current-password"
                    />

                    {/* Eye toggle on visual right */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#2A4365] hover:text-[#0B2E59] p-1 transition-colors shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none rounded"
                      title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox: تذكرني */}
                <div className="flex items-center justify-end pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2A4365] font-bold">
                    <span>تذكرني</span>
                    <div
                      role="checkbox"
                      aria-checked={rememberMe}
                      tabIndex={0}
                      onClick={() => setRememberMe(!rememberMe)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setRememberMe(!rememberMe);
                        }
                      }}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none ${
                        rememberMe
                          ? 'bg-[#0078D4] border-[#0078D4] text-white shadow-xs'
                          : 'bg-white/80 border-white/95 shadow-2xs'
                      }`}
                    >
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
                    </div>
                  </label>
                </div>

                {/* Main button: تسجيل الدخول مع Glow فخم */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[50px] rounded-[14px] text-white font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  style={{
                    background: 'linear-gradient(135deg, #0078D4 0%, #0060B2 100%)',
                    boxShadow: '0 10px 25px -4px rgba(0, 120, 212, 0.55), 0 0 25px 3px rgba(0, 164, 239, 0.45)',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-4 h-4" />
                      <span>تسجيل الدخول</span>
                    </>
                  )}
                </button>

                {/* Secondary link: هل نسيت كلمة المرور؟ */}
                <div className="pt-3 flex items-center justify-center">
                  <div className="w-full flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-300/60" />
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-xs text-[#0078D4] hover:text-[#106EBE] hover:underline font-bold whitespace-nowrap transition-colors cursor-pointer p-1 focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none rounded"
                    >
                      هل نسيت كلمة المرور؟
                    </button>
                    <div className="flex-1 h-px bg-slate-300/60" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer: الحقوق محفوظة لــ Paradise AI */}
        <div className="relative z-10 flex items-center justify-center py-2">
          <p className="text-[11px] sm:text-xs font-semibold text-[#42566F]/90 tracking-wide flex items-center gap-1.5">
            <span>جميع الحقوق محفوظة لــ</span>
            <span className="font-bold text-[#0078D4] hover:underline cursor-default">Paradise AI</span>
            <span>© {new Date().getFullYear()}</span>
          </p>
        </div>
      </section>

      {/* Forgot Password Modal with Glassmorphism */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="استعادة كلمة المرور"
            className="shadow-2xl max-w-sm w-full p-6 rounded-2xl space-y-4 text-right text-[#323130]"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 25px 60px -10px rgba(0, 40, 90, 0.25)',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#0B2E59] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#0078D4]" aria-hidden="true" />
                <span>استعادة كلمة المرور</span>
              </h3>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-500 hover:text-slate-700 text-sm font-bold p-1 focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none rounded"
                aria-label="إغلاق نافذة استعادة كلمة المرور"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <p>
                وفقاً لسياسة أمن المعلومات في <strong>بوابة الخدمة الذاتية للموظف</strong>، يمكن إعادة تعيين كلمة المرور عبر التواصل مع مسؤول النظم بالموارد البشرية أو مكتب المساعدة الداخلي.
              </p>
              <div 
                className="p-3 rounded-xl space-y-1"
                style={{
                  background: 'rgba(239, 246, 255, 0.8)',
                  border: '1px solid rgba(191, 219, 254, 0.6)',
                }}
              >
                <div className="text-blue-900 font-bold">إعادة تعيين كلمة المرور:</div>
                <div className="text-xs text-[#0B2E59] font-medium">
                  يتم إرسال رابط إعادة التعيين الآمن إلى البريد الإلكتروني الحكومي المسجل بالملف الوظيفي بعد التحقق من الهوية.
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                رقم المساعدة المباشر: تحويلة 1044 / IT Helpdesk.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="px-4 py-2 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
                }}
              >
                فهمت، حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
