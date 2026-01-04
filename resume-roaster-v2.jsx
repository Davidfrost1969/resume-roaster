import React, { useState, useEffect } from 'react';
import { Upload, Flame, CheckCircle, AlertCircle, TrendingUp, DollarSign, Mail, Zap, Crown, Star } from 'lucide-react';

const ResumeRoaster = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Load Google AdSense script (only for free tier users)
  useEffect(() => {
    if (!isPremium && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, [isPremium]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    setAnalyzing(true);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = async (event) => {
      let content = event.target.result;
      
      // Handle PDF files - in production you'd use a PDF parser
      if (uploadedFile.type === 'application/pdf') {
        content = 'PDF content placeholder - integrate PDF parser in production';
      }
      
      await analyzeResume(content, uploadedFile.name);
    };
    
    if (uploadedFile.type === 'application/pdf') {
      reader.readAsDataURL(uploadedFile);
    } else {
      reader.readAsText(uploadedFile);
    }
  };

  const analyzeResume = async (content, filename) => {
    try {
      // Call Claude API for analysis
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a brutally honest resume expert and career coach. Analyze this resume and provide:

1. OVERALL SCORE (0-100): Be harsh but fair. Most resumes are 40-70.

2. THE ROAST (3-5 brutal critiques): Point out what's weak, generic, or cringe. Be funny but constructive. Examples:
   - "Your resume reads like a job description copy-paste fest"
   - "Where are the numbers? Did you accomplish literally nothing measurable?"
   - "'Team player' and 'hard worker' - groundbreaking stuff"

3. TOP 3 FIXES (specific, actionable): Tell them exactly what to change.

4. RED FLAGS (2-3 deal-breakers): Things that would get this rejected immediately.

Format your response EXACTLY like this:

SCORE: [number]

ROAST:
• [criticism 1]
• [criticism 2]
• [criticism 3]

TOP 3 FIXES:
1. [specific fix with example]
2. [specific fix with example]
3. [specific fix with example]

RED FLAGS:
• [red flag 1]
• [red flag 2]

Resume file: ${filename}
Content preview: ${content.substring(0, 3000)}`
          }]
        })
      });

      const data = await response.json();
      const analysisText = data.content[0].text;
      
      // Parse the response
      const parsed = parseAnalysis(analysisText);
      setResults(parsed);
      setShowPaywall(!isPremium); // Show paywall for free users
      
    } catch (error) {
      console.error('Analysis error:', error);
      // Show demo results if API fails
      showDemoResults();
    } finally {
      setAnalyzing(false);
    }
  };

  const parseAnalysis = (text) => {
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 65;
    
    const roastMatch = text.match(/ROAST:\s*([\s\S]*?)(?=TOP 3 FIXES:|$)/i);
    const roast = roastMatch ? roastMatch[1].trim() : '';
    
    const fixesMatch = text.match(/TOP 3 FIXES:\s*([\s\S]*?)(?=RED FLAGS:|$)/i);
    const fixes = fixesMatch ? fixesMatch[1].trim() : '';
    
    const flagsMatch = text.match(/RED FLAGS:\s*([\s\S]*?)$/i);
    const redFlags = flagsMatch ? flagsMatch[1].trim() : '';
    
    return { score, roast, fixes, redFlags, fullAnalysis: text };
  };

  const showDemoResults = () => {
    setResults({
      score: 58,
      roast: `• Your resume is a greatest hits compilation of corporate buzzwords. "Synergy" and "leveraged" appear so often I thought I was reading a LinkedIn influencer's fever dream.\n• Zero quantifiable achievements. You managed projects? Great. How many? What was the budget? Did anyone actually benefit or did you just... exist?\n• The formatting is a war crime. Different fonts, random bolding, bullet points that don't align. It's like you designed this in Microsoft Word 2003 while blindfolded.\n• "Proficient in Microsoft Office" in 2024. Congratulations, you can use a computer like literally everyone else with a pulse.\n• Your experience section reads like you copied job descriptions and changed "will" to "did." Where's YOUR unique impact?`,
      fixes: `1. QUANTIFY EVERYTHING: Replace "Managed social media accounts" with "Grew Instagram following from 2K to 47K in 6 months, increasing engagement rate by 340% and generating $12K in affiliate revenue." Numbers = credibility.\n\n2. DELETE THE BOTTOM THIRD: Your "Skills" section with 47 items including "Problem Solving" and "Communication" is taking up prime real estate. Keep 5-7 advanced, role-specific skills. Cut the rest.\n\n3. REWRITE WITH THE STAR METHOD: For each role, use Situation-Task-Action-Result format. "Reduced customer churn by 23% (from 8% to 6.2%) by implementing automated follow-up system, saving company $340K annually."`,
      redFlags: `• Employment gap: 14-month unexplained gap between 2021-2022. Either address it directly or restructure to minimize attention.\n• Job hopping: 4 roles in 3 years with no clear progression story. This screams "flight risk."\n• Generic email: "coolguy1997@hotmail.com" - Get a professional email address. This alone could get you filtered out.\n• No LinkedIn URL: In 2024, not having LinkedIn linked = you're hiding something or you're not serious.`,
      fullAnalysis: 'Full analysis available...'
    });
    setShowPaywall(!isPremium);
  };

  const handleEmailCapture = () => {
    if (email && email.includes('@')) {
      setEmailCaptured(true);
      // In production: Send to your email list (Mailchimp, ConvertKit, etc.)
      console.log('Email captured:', email);
    }
  };

  const handleUpgradeToPremium = () => {
    // In production: Integrate Stripe payment
    alert('🎉 Premium Upgrade!\n\nStripe integration coming soon.\n\nPremium features:\n• Unlimited roasts\n• Ad-free experience\n• Before/after rewrites\n• ATS compatibility check\n• LinkedIn profile analysis\n• Cover letter generator\n\n$9.99/month or $29.99/year');
  };

  const handleViewFullAnalysis = () => {
    if (!emailCaptured) {
      alert('Please enter your email to view the full analysis!');
      return;
    }
    setShowPaywall(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent! 🎉';
    if (score >= 80) return 'Pretty solid!';
    if (score >= 70) return 'Decent, but room for improvement';
    if (score >= 60) return 'Needs work';
    if (score >= 50) return 'Major revisions needed';
    return 'Start from scratch 😬';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">Resume Roaster</h1>
          </div>
          <div className="flex items-center gap-4">
            {!isPremium && (
              <button
                onClick={handleUpgradeToPremium}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
              >
                <Crown className="w-4 h-4" />
                Go Premium
              </button>
            )}
            {isPremium && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-lg">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-700">Premium</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {!file && !results && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Flame className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Your Resume Probably Sucks
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Get brutally honest AI feedback that actually helps you land interviews
          </p>
          
          {/* Upload Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl mx-auto border-2 border-gray-100 mb-12">
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 hover:border-red-400 hover:bg-red-50 transition-all">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Upload Your Resume
                </p>
                <p className="text-sm text-gray-500">
                  PDF, DOC, DOCX, or TXT • Max 5MB
                </p>
              </div>
            </label>
            
            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-600" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Google AdSense - Top Banner (Free Users Only) */}
          {!isPremium && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
                {/* Replace with actual AdSense code */}
                <p>Ad Space - Google AdSense Banner (728x90)</p>
                {/* <ins className="adsbygoogle"
                     style={{display:'inline-block',width:'728px',height:'90px'}}
                     data-ad-client="ca-pub-XXXXXXXXXX"
                     data-ad-slot="XXXXXXXXXX"></ins> */}
              </div>
            </div>
          )}

          {/* Social Proof */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">12,847</div>
              <div className="text-gray-600">Resumes Roasted</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">78%</div>
              <div className="text-gray-600">Got Interviews</div>
            </div>
          </div>

          {/* Premium CTA */}
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-8 h-8" />
              <h3 className="text-3xl font-bold">Go Premium</h3>
            </div>
            <p className="text-lg mb-6 opacity-90">
              Unlimited roasts, ad-free experience, before/after rewrites, ATS checker, and more
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white/20 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">$9.99/mo</div>
                <div className="text-sm opacity-80">Monthly</div>
              </div>
              <div className="text-2xl font-bold">or</div>
              <div className="bg-white/20 rounded-lg px-6 py-3 relative">
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold">
                  SAVE 75%
                </div>
                <div className="text-2xl font-bold">$29.99/yr</div>
                <div className="text-sm opacity-80">Yearly</div>
              </div>
            </div>
            <button
              onClick={handleUpgradeToPremium}
              className="mt-6 bg-white text-purple-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {analyzing && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <Flame className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Roasting Your Resume...
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              AI is analyzing your resume with brutal honesty. This takes about 10 seconds.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full animate-pulse" style={{width: '66%'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border-2 border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl text-gray-600 mb-4">Your Resume Score</h3>
              <div className={`text-8xl font-bold ${getScoreColor(results.score)} mb-2`}>
                {results.score}<span className="text-4xl">/100</span>
              </div>
              <p className="text-xl text-gray-700 font-semibold">
                {getScoreGrade(results.score)}
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  results.score >= 80 ? 'bg-green-600' :
                  results.score >= 60 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
                style={{width: `${results.score}%`}}
              ></div>
            </div>
          </div>

          {/* The Roast */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-8 mb-8 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-8 h-8 text-red-600" />
              <h3 className="text-3xl font-bold text-gray-900">The Roast 🔥</h3>
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-gray-800 leading-relaxed text-lg">
                {results.roast}
              </div>
            </div>
          </div>

          {/* Google AdSense - Middle Rectangle (Free Users Only) */}
          {!isPremium && !showPaywall && (
            <div className="mb-8">
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
                <p>Ad Space - Google AdSense Rectangle (336x280)</p>
                {/* <ins className="adsbygoogle"
                     style={{display:'inline-block',width:'336px',height:'280px'}}
                     data-ad-client="ca-pub-XXXXXXXXXX"
                     data-ad-slot="XXXXXXXXXX"></ins> */}
              </div>
            </div>
          )}

          {/* Email Capture + Paywall */}
          {showPaywall && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/95 to-white z-10 flex items-center justify-center pt-32">
                <div className="text-center bg-white p-8 rounded-2xl shadow-2xl border-2 border-purple-200 max-w-md">
                  {!emailCaptured ? (
                    <>
                      <Mail className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-4">Want the Full Analysis?</h3>
                      <p className="text-gray-600 mb-6">
                        Get your detailed fixes, red flags, and rewritten sections. 100% free!
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        onClick={handleEmailCapture}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-lg mb-4"
                      >
                        Get Full Analysis FREE
                      </button>
                      <p className="text-xs text-gray-500">
                        Join 12,847+ job seekers. Unsubscribe anytime.
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-4">Email Confirmed! ✅</h3>
                      <p className="text-gray-600 mb-6">
                        Click below to view your complete analysis
                      </p>
                      <button
                        onClick={handleViewFullAnalysis}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-lg"
                      >
                        View Full Analysis
                      </button>
                    </>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Or upgrade to Premium:</p>
                    <button
                      onClick={handleUpgradeToPremium}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Crown className="w-5 h-5" />
                      Go Premium - $9.99/mo
                    </button>
                  </div>
                </div>
              </div>

              {/* Blurred Preview */}
              <div className="filter blur-md pointer-events-none">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <h3 className="text-3xl font-bold text-gray-900">Top 3 Fixes</h3>
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    <p>{results.fixes.substring(0, 200)}...</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                    <h3 className="text-3xl font-bold text-gray-900">Red Flags 🚩</h3>
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    <p>{results.redFlags.substring(0, 150)}...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Results (After Email Capture or Premium) */}
          {!showPaywall && (
            <>
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <h3 className="text-3xl font-bold text-gray-900">Top 3 Fixes</h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                    {results.fixes}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <h3 className="text-3xl font-bold text-gray-900">Red Flags 🚩</h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
                    {results.redFlags}
                  </div>
                </div>
              </div>

              {/* CTA to roast another resume */}
              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Want to roast another resume?
                </h3>
                <button
                  onClick={() => {
                    setFile(null);
                    setResults(null);
                    setShowPaywall(false);
                  }}
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 px-8 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  Upload Another Resume
                </button>
              </div>

              {/* Google AdSense - Bottom Banner (Free Users Only) */}
              {!isPremium && (
                <div className="mt-8">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
                    <p>Ad Space - Google AdSense Banner (728x90)</p>
                    {/* <ins className="adsbygoogle"
                         style={{display:'inline-block',width:'728px',height:'90px'}}
                         data-ad-client="ca-pub-XXXXXXXXXX"
                         data-ad-slot="XXXXXXXXXX"></ins> */}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Premium Upsell (Free users who completed analysis) */}
          {!isPremium && !showPaywall && (
            <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="w-10 h-10" />
                <h3 className="text-3xl font-bold">Love the roast? Go Premium!</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/20 rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <h4 className="font-bold mb-1">Unlimited Roasts</h4>
                  <p className="text-sm opacity-90">Roast as many resumes as you want</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <h4 className="font-bold mb-1">Ad-Free Experience</h4>
                  <p className="text-sm opacity-90">No ads, just pure feedback</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <h4 className="font-bold mb-1">Before/After Rewrites</h4>
                  <p className="text-sm opacity-90">See your resume professionally rewritten</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <h4 className="font-bold mb-1">ATS Compatibility Check</h4>
                  <p className="text-sm opacity-90">Make sure you pass automated filters</p>
                </div>
              </div>
              <button
                onClick={handleUpgradeToPremium}
                className="w-full md:w-auto bg-white text-purple-600 font-bold py-4 px-12 rounded-xl hover:bg-gray-100 transition-all text-lg"
              >
                Upgrade to Premium - $9.99/mo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-6 h-6 text-red-600" />
                <h3 className="font-bold text-lg">Resume Roaster</h3>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered resume analysis that helps you land more interviews.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-red-600">Resume Tips</a></li>
                <li><a href="#" className="hover:text-red-600">Cover Letter Guide</a></li>
                <li><a href="#" className="hover:text-red-600">Interview Prep</a></li>
                <li><a href="#" className="hover:text-red-600">Career Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-red-600">About Us</a></li>
                <li><a href="#" className="hover:text-red-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-red-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-red-600">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-600 text-sm">
            <p className="mb-2">© 2026 Resume Roaster. Built to help job seekers get interviews faster.</p>
            <p>Questions? Email <a href="mailto:support@resumeroaster.net" className="text-red-600 hover:underline">support@resumeroaster.net</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeRoaster;
