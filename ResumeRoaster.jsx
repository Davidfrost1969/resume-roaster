import React, { useState, useEffect } from 'react';
import { Upload, Flame, CheckCircle, AlertCircle, TrendingUp, DollarSign, Mail, Zap, Crown, Star } from 'lucide-react';

const ResumeRoaster = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
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

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(uploadedFile.type)) {
      alert('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    setFile(uploadedFile);
    setAnalyzing(true);
    setResults(null);
    setShowPaywall(false);

    try {
      // Read file content
      const text = await readFileContent(uploadedFile);
      
      // Call Claude API for analysis
      const analysis = await analyzeResume(text);
      
      setResults(analysis);
      
      // Show paywall after brief preview (for free users)
      if (!isPremium) {
        setTimeout(() => {
          setShowPaywall(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Sorry, something went wrong. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const analyzeResume = async (resumeText) => {
    // Call Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_API_KEY_HERE', // Replace with actual API key
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are a brutally honest resume critic. Analyze this resume and provide:

1. A harsh but funny "roast" (2-3 sentences that would make them laugh but also realize they need to improve)
2. An overall score out of 100
3. Top 3 specific, actionable fixes (be detailed)
4. Major red flags that would make hiring managers reject it

Be direct, specific, and helpful. Use a conversational tone.

Resume:
${resumeText}`
        }]
      })
    });

    const data = await response.json();
    const analysisText = data.content[0].text;

    // Parse the response
    return {
      roast: extractSection(analysisText, 'roast'),
      score: extractScore(analysisText),
      fixes: extractSection(analysisText, 'fixes'),
      redFlags: extractSection(analysisText, 'red flags')
    };
  };

  const extractSection = (text, section) => {
    const patterns = {
      'roast': /(?:roast|harsh|funny)[\s\S]*?:\s*([\s\S]*?)(?=\n\n|\d\.|score|overall)/i,
      'fixes': /(?:top 3|fixes|improvements)[\s\S]*?:([\s\S]*?)(?=\n\n|red flags|major)/i,
      'red flags': /(?:red flags|major red flags)[\s\S]*?:([\s\S]*?)$/i
    };
    
    const match = text.match(patterns[section]);
    return match ? match[1].trim() : 'Analysis not available';
  };

  const extractScore = (text) => {
    const match = text.match(/score[\s\S]*?(\d+)\s*(?:out of|\/)\s*100/i);
    return match ? parseInt(match[1]) : 0;
  };

  const handleEmailCapture = (e) => {
    e.preventDefault();
    setEmailCaptured(true);
    // Here you would send the email to your backend/email service
    alert('Thanks! Check your email for exclusive resume tips.');
  };

  const handleUpgradeToPremium = () => {
    // Redirect to payment page (Stripe, etc.)
    alert('Redirecting to payment... (integrate with Stripe here)');
    // For demo purposes, we'll just set premium to true
    // In production, this would only happen after successful payment
    // setIsPremium(true);
  };

  const handlePaywallPurchase = () => {
    // Process payment
    alert('Processing payment... (integrate with Stripe here)');
    // After successful payment:
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
            Get Your Resume <span className="text-red-600">Roasted</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your resume and get brutally honest AI feedback. No sugar-coating, 
            just actionable advice to help you land more interviews.
          </p>

          {/* Upload Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto border-4 border-dashed border-gray-300 hover:border-red-400 transition-all">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <span className="text-lg font-semibold text-gray-700 hover:text-red-600 transition-colors">
                Click to upload or drag and drop
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">PDF, DOCX, or TXT (max 5MB)</p>
          </div>

          {/* Social Proof */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Zap className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Instant Analysis</h3>
              <p className="text-gray-600">Get results in under 30 seconds</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Actionable Fixes</h3>
              <p className="text-gray-600">Specific improvements you can make today</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Star className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Trained on thousands of successful resumes</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {analyzing && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Flame className="w-16 h-16 text-red-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Roasting your resume...</h3>
          <p className="text-gray-600">Our AI is analyzing every detail</p>
        </div>
      )}

      {/* Results */}
      {results && !analyzing && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => { setFile(null); setResults(null); setShowPaywall(false); }}
            className="mb-6 text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Analyze another resume
          </button>

          {/* Roast Section */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Roast 🔥</h3>
            </div>
            <p className="text-xl leading-relaxed">{results.roast}</p>
          </div>

          {/* Score */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Overall Score</h3>
            <div className={`text-7xl font-bold ${getScoreColor(results.score)} mb-2`}>
              {results.score}
              <span className="text-4xl text-gray-400">/100</span>
            </div>
            <p className="text-xl text-gray-600">{getScoreGrade(results.score)}</p>
          </div>

          {/* Paywall Overlay */}
          {showPaywall && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white z-10 flex items-end justify-center pb-8">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg border-2 border-purple-200">
                  <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                    Unlock Your Full Analysis
                  </h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Get the complete breakdown including:
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Top 3 specific fixes to land more interviews</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Major red flags hiring managers see</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Detailed improvement roadmap</span>
                    </li>
                  </ul>
                  <button
                    onClick={handlePaywallPurchase}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all mb-3"
                  >
                    Unlock for $19.99
                  </button>
                  <p className="text-sm text-gray-500 text-center">One-time payment • Instant access</p>
                </div>
              </div>

              {/* Blurred content */}
              <div className="filter blur-sm pointer-events-none">
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Top 3 Fixes</h3>
                  </div>
                  <div className="space-y-4 text-gray-700">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                    <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* After Purchase - Full Results */}
          {!showPaywall && (
            <>
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Top 3 Fixes</h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {results.fixes}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Red Flags 🚩</h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {results.redFlags}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600">
          <p className="mb-2">Built to help job seekers get interviews faster</p>
          <p className="text-sm">Questions? Email support@resumeroaster.com</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeRoaster;
