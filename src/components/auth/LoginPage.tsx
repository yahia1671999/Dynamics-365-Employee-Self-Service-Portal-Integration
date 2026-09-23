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

interface LoginPageProps {
  onLoginSuccess: (cardId: string) => void;
  defaultCardId?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  defaultCardId = '29897622655477',
}) => {
  const [username, setUsername] = useState(defaultCardId);
  const [password, setPassword] = useState('Pass@word1');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().replace(/\s/g, '');

    // 1. Validation for username / National ID
    if (!cleanUsername) {
      setErrorMessage('يرجى إدخال اسم المستخدم.');
      return;
    }

    if (cleanUsername.length !== 14 || !/^\d+$/.test(cleanUsername)) {
      setErrorMessage('اسم المستخدم غير صحيح. يجب أن يتكون من 14 رقماً قومياً.');
      return;
    }

    // 2. Validation for Password
    if (password !== 'Pass@word1') {
      setErrorMessage('كلمة المرور غير صحيحة. يرجى إدخال كلمة المرور المعتمدة (Pass@word1).');
      return;
    }

    // 3. Authenticate and proceed
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (rememberMe) {
        localStorage.setItem('d365_remembered_card', cleanUsername);
      } else {
        localStorage.removeItem('d365_remembered_card');
      }
      onLoginSuccess(cleanUsername);
    }, 600);
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col lg:flex-row overflow-x-hidden font-sans selection:bg-[#0078D4] selection:text-white"
      dir="rtl"
    >
      {/* =========================================================================
          LEFT SIDE (48% on Desktop):
          Realistic high-res corporate office glass skyscraper,
          with subtle navy gradient overlay, Dynamics 365 branding,
          portal title + subtitle, and 3 feature icons.
          ========================================================================= */}
      <section className="relative w-full lg:w-[48%] min-h-[560px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white overflow-hidden shrink-0">
        {/* Realistic High-Res Corporate Glass Office Building Photograph */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Corporate Glass Office Skyscraper"
            className="w-full h-full object-cover object-center transform scale-105"
            loading="eager"
          />
          {/* Subtle navy-blue gradient overlay for high contrast and executive polish */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                'linear-gradient(135deg, rgba(7, 27, 59, 0.74) 0%, rgba(11, 46, 89, 0.54) 45%, rgba(15, 60, 114, 0.44) 75%, rgba(6, 22, 48, 0.80) 100%)',
            }}
          />
        </div>

        {/* TOP: Microsoft Dynamics 365 Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            {/* Official Microsoft 4-Color Squares Glyph */}
            <div className="grid grid-cols-2 gap-1 w-6 h-6 shrink-0">
              <div className="bg-[#F25022] w-2.5 h-2.5 rounded-[1px]" />
              <div className="bg-[#7FBA00] w-2.5 h-2.5 rounded-[1px]" />
              <div className="bg-[#00A4EF] w-2.5 h-2.5 rounded-[1px]" />
              <div className="bg-[#FFB900] w-2.5 h-2.5 rounded-[1px]" />
            </div>
            <div className="flex flex-col text-right leading-tight">
              <span className="text-xs text-white/90 font-normal tracking-wide">Microsoft</span>
              <span className="text-base text-white font-bold tracking-tight">Dynamics 365</span>
            </div>
          </div>
        </div>

        {/* CENTER-LEFT: Large Arabic Title & Subtitle */}
        <div className="relative z-10 my-auto py-8 max-w-xl text-right">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white tracking-tight drop-shadow-md leading-[1.25]">
            بوابة الخدمة الذاتية للموظف
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-medium text-white/90 drop-shadow-sm">
            خدماتك.. في مكان واحد
          </p>
        </div>

        {/* BOTTOM: Three Horizontal Feature Icons in Microsoft Fluent Design */}
        <div className="relative z-10 pb-2">
          <div className="flex items-center justify-start gap-8 sm:gap-11 select-none">
            {/* 1. سهولة الوصول (Microsoft Fluent Person / Accessibility) */}
            <div className="flex flex-col items-center gap-2.5 group cursor-default">
              <div 
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_24px_-6px_rgba(0,120,212,0.4)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)',
                }}
              >
                {/* Official Fluent 24/Regular "Person / Fast Access" Icon */}
                <svg className="w-6 h-6 drop-shadow-sm text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M4 20C4 16.134 7.58172 13 12 13C16.4183 13 20 16.134 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Subtle Fluent Accent Spark */}
                  <circle cx="17.5" cy="5.5" r="1.5" fill="#38BDF8" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-white/95 tracking-wide">سهولة الوصول</span>
            </div>

            {/* 2. أمان وموثوقية (Microsoft Fluent Shield Keyhole / Security) */}
            <div className="flex flex-col items-center gap-2.5 group cursor-default">
              <div 
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_24px_-6px_rgba(16,185,129,0.4)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)',
                }}
              >
                {/* Official Fluent 24/Regular "Shield Check / Reliability" Icon */}
                <svg className="w-6 h-6 drop-shadow-sm text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M9 11.5L11 13.5L15.5 9" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-white/95 tracking-wide">أمان وموثوقية</span>
            </div>

            {/* 3. دعم مستمر (Microsoft Fluent Headset Support / Customer Care) */}
            <div className="flex flex-col items-center gap-2.5 group cursor-default">
              <div 
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_24px_-6px_rgba(245,158,11,0.4)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)',
                }}
              >
                {/* Official Fluent 24/Regular "Headset / Support" Icon */}
                <svg className="w-6 h-6 drop-shadow-sm text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V17C21 18.6569 19.6569 20 18 20H17V15H19.5V12C19.5 7.85786 16.1421 4.5 12 4.5C7.85786 4.5 4.5 7.85786 4.5 12V15H7V20H6C4.34315 20 3 18.6569 3 17V12Z" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M17 19H12" 
                    stroke="currentColor" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-white/95 tracking-wide">دعم مستمر</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RIGHT SIDE (52% on Desktop):
          Professional frosted glass background with layered floating glass orbs
          and Microsoft Fluent prisms creating depth, behind the centered glass login card.
          ========================================================================= */}
      <section
        className="relative w-full lg:w-[52%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #F8FAFD 0%, #EFF5FC 50%, #E6EFF9 100%)',
        }}
      >
        {/* Layered Architectural Glass Prisms & Fluent Bokeh Orbs in the background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
          {/* Glass Orb 1 (Top-Left behind card): Soft cyan-blue glass glow */}
          <div 
            className="absolute -top-16 -left-16 w-[360px] h-[360px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 164, 239, 0.22) 0%, rgba(0, 120, 212, 0.08) 55%, transparent 75%)',
              filter: 'blur(32px)',
            }}
          />

          {/* Glass Orb 2 (Center-Right behind card): Royal blue / azure illumination */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -right-20 w-[420px] h-[420px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 120, 212, 0.18) 0%, rgba(16, 110, 190, 0.06) 60%, transparent 75%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Glass Orb 3 (Bottom-Left): Light ice-blue ambient */}
          <div 
            className="absolute -bottom-20 left-1/4 w-[340px] h-[340px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(147, 197, 253, 0.25) 0%, rgba(186, 230, 253, 0.1) 50%, transparent 75%)',
              filter: 'blur(36px)',
            }}
          />

          {/* Floating Subtle Frosted Glass Ribbon (Dynamics Flow) */}
          <div
            className="absolute top-[22%] -left-36 w-[620px] h-[180px] -rotate-12 rounded-[50px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.08) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 20px 40px rgba(0, 120, 212, 0.05)',
            }}
          />

          {/* Floating Subtle Frosted Glass Hexagon / Geometric Pill (Bottom-Right) */}
          <div
            className="absolute bottom-[10%] -right-16 w-[320px] h-[160px] rotate-[15deg] rounded-[40px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.55)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
            }}
          />
        </div>

        {/* Top spacer (previously language button) */}
        <div className="relative z-20 h-4" />

        {/* CENTERED: ULTRA-LUXURIOUS TRUE GLASSMORPHISM LOGIN CARD */}
        <div className="relative z-10 my-auto flex items-center justify-center w-full py-4">
          <div
            className="w-full max-w-[480px] p-8 sm:p-10 relative overflow-hidden transition-all duration-300 text-[#323130] group hover:shadow-[0_35px_90px_-10px_rgba(0,120,212,0.22)]"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.07) 100%)',
              backdropFilter: 'blur(45px) saturate(180%)',
              WebkitBackdropFilter: 'blur(45px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              boxShadow: `
                0 25px 70px -10px rgba(0, 50, 110, 0.12),
                0 10px 30px -5px rgba(0, 120, 212, 0.08),
                0 0 45px -5px rgba(0, 120, 212, 0.10),
                0 0 0 1px rgba(255, 255, 255, 0.3) inset,
                0 1px 3px 0 rgba(255, 255, 255, 0.8) inset
              `,
              borderRadius: '28px',
            }}
          >
            {/* Ambient Inner Glow (Soft Microsoft Dynamics Azure Bloom) */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(0, 164, 239, 0.15) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <div 
              className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(0, 120, 212, 0.12) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
            />

            {/* Specular Light Reflection Streak across top glass edge */}
            <div 
              className="absolute -top-12 -left-12 -right-12 h-28 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0) 100%)',
                filter: 'blur(3px)',
              }}
            />

            {/* Title & Subtitle inside Card */}
            <div className="text-center space-y-1 mb-8 relative z-10">
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#0B2E59] tracking-tight">
                تسجيل الدخول
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#0078D4] tracking-wide">
                بوابة الخدمة الذاتية للموظف
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div 
                className="mb-4 p-3 rounded-xl text-red-700 text-xs flex items-center gap-2 shadow-xs animate-shake relative z-10"
                style={{
                  background: 'rgba(254, 242, 242, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(252, 165, 165, 0.5)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Field 1: اسم المستخدم */}
              <div className="space-y-1.5">
                <label className="block text-right text-xs font-semibold text-[#42566F]">
                  اسم المستخدم
                </label>
                <div 
                  className="relative rounded-[12px] focus-within:ring-2 focus-within:ring-[#0078D4]/30 focus-within:border-white transition-all duration-200 h-[50px] flex items-center px-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.38)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                    boxShadow: '0 2px 8px rgba(0, 50, 100, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {/* User line icon on visual left */}
                  <User className="w-4 h-4 text-[#42566F] shrink-0" />
                  {/* Input field */}
                  <input
                    type="text"
                    maxLength={14}
                    value={username}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setUsername(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="29897622655477"
                    className="flex-1 h-full bg-transparent border-none outline-none text-[#0B2E59] text-sm font-mono tracking-wider text-right pr-2 placeholder:text-slate-400 font-semibold"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Field 2: كلمة المرور */}
              <div className="space-y-1.5">
                <label className="block text-right text-xs font-semibold text-[#42566F]">
                  كلمة المرور
                </label>
                <div 
                  className="relative rounded-[12px] focus-within:ring-2 focus-within:ring-[#0078D4]/30 focus-within:border-white transition-all duration-200 h-[50px] flex items-center px-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.38)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                    boxShadow: '0 2px 8px rgba(0, 50, 100, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {/* Lock line icon on visual left */}
                  <Lock className="w-4 h-4 text-[#42566F] shrink-0" />

                  {/* Input field */}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="flex-1 h-full bg-transparent border-none outline-none text-[#0B2E59] text-sm font-mono tracking-wider text-right px-2 placeholder:text-slate-400 font-semibold"
                    autoComplete="current-password"
                    required
                  />

                  {/* Eye toggle on visual right */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#42566F] hover:text-[#0B2E59] p-1 transition-colors shrink-0"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox: تذكرني */}
              <div className="flex items-center justify-end pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#42566F] font-semibold">
                  <span>تذكرني</span>
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      rememberMe
                        ? 'bg-[#0078D4] border-[#0078D4] text-white shadow-xs'
                        : 'bg-white/70 border-white/90 shadow-2xs'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </label>
              </div>

              {/* Main button: تسجيل الدخول */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] rounded-[12px] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #0078D4 0%, #106EBE 100%)',
                  boxShadow: '0 10px 25px -4px rgba(0, 120, 212, 0.45), 0 0 15px rgba(0, 120, 212, 0.25)',
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
                  <div className="flex-1 h-px bg-slate-200/60" />
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-[#0078D4] hover:text-[#106EBE] hover:underline font-semibold whitespace-nowrap transition-colors"
                  >
                    هل نسيت كلمة المرور؟
                  </button>
                  <div className="flex-1 h-px bg-slate-200/60" />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer: الحقوق محفوظة لــ Paradise AI */}
        <div className="relative z-10 flex items-center justify-center py-2 select-none">
          <p className="text-[11px] sm:text-xs font-medium text-[#42566F]/80 tracking-wide flex items-center gap-1.5">
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
                <HelpCircle className="w-4 h-4 text-[#0078D4]" />
                <span>استعادة كلمة المرور</span>
              </h3>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
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
                <div className="text-blue-900 font-bold">كلمة المرور الافتراضية للنظام:</div>
                <div className="text-sm font-mono font-bold text-[#0078D4]">Pass@word1</div>
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
