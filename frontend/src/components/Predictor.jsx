import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';
import { ArrowLeft, Activity, Target, Zap, Clock, TrendingUp, ShieldCheck, Wind, Globe, Download, History, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AnimatedBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 perspective-[1000px]">
        {/* Radar Rings matching screenshot */}
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="absolute top-[40%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-800/20 border-t-cyan-500/40"
        />
        <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
            className="absolute top-[50%] right-[10%] -translate-y-1/2 w-[800px] h-[800px] rounded-[48%] border border-sky-800/20 border-l-sky-400/40"
        />

        {/* 5 Massive 3D Moving Orbs */}
        <motion.div animate={{ y: [0, -120, 0], x: [0, 60, 0], scale: [1, 1.2, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[5%] left-[5%] w-[450px] h-[450px] rounded-full bg-[#0ea5e9]/15 blur-[100px] mix-blend-screen" />
        <motion.div animate={{ y: [0, 150, 0], x: [0, -80, 0], scale: [1, 1.25, 1] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[30%] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-600/15 blur-[120px] mix-blend-screen" />
        <motion.div animate={{ y: [0, -100, 0], x: [0, 120, 0], scale: [1, 1.1, 1] }} transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-[0%] left-[30%] w-[500px] h-[500px] rounded-full bg-cyan-800/20 blur-[90px] mix-blend-screen" />
        <motion.div animate={{ y: [0, 80, 0], x: [0, -100, 0], scale: [1, 1.3, 1] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute bottom-[20%] right-[30%] w-[350px] h-[350px] rounded-full bg-sky-500/15 blur-[100px] mix-blend-screen" />
        <motion.div animate={{ y: [0, -150, 0], x: [0, 150, 0], scale: [1, 1.4, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }} className="absolute top-[-10%] right-[25%] w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[150px] mix-blend-screen" />

        {/* Highly Visible Floating Data Particles */}
        {[...Array(20)].map((_, i) => (
            <motion.div 
               key={i}
               animate={{ y: [0, -150 - (Math.random()*200), 0], x: [0, Math.random()*100 - 50, 0], opacity: [0.1, 0.8, 0.1] }} 
               transition={{ duration: 8 + (Math.random() * 10), repeat: Infinity, ease: "easeInOut", delay: Math.random() * 5 }} 
               className="absolute rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"
               style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`
               }}
            />
        ))}
    </div>
);

const Predictor = () => {
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState({ areas: [], elements: [], years: [] });
  const [formData, setFormData] = useState({ Area: '', Element: '', Year: '2024' });
  const [prediction, setPrediction] = useState(null);
  const [forecastData, setForecastData] = useState({ history: [], forecast: [] });
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const reportRef = useRef(null);
  const areaChartRef = useRef(null);
  const barChartRef = useRef(null);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isForecast = payload[0].name === 'forecastValue' || payload[0].dataKey === 'forecastValue';
      const color = payload[0].stroke || payload[0].color || "#0ea5e9";
      return (
        <div className="bg-[#0f172a] border border-sky-900/50 px-4 py-3 rounded-xl shadow-2xl flex flex-col gap-1 min-w-[140px]">
          <p className="text-[13px] font-bold" style={{ color: color }}>{label}</p>
          <p className="text-[12px] font-bold" style={{ color: color }}>
            {payload[0].name === 'forecastValue' ? "Forecast" : "Historical"} : {Number(payload[0].value).toFixed(4)}
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('ghg_prediction_history');
    if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
    }

    axios.get(`${API_URL}/metadata`).then(res => {
      setMetadata(res.data);
      if (res.data.areas.length > 0) {
        setFormData(prev => ({ ...prev, Area: "Afghanistan", Element: "Emissions (CH4)", Year: '2024' }));
        fetchForecast("Afghanistan", "Emissions (CH4)");
      }
    }).catch(err => setError("Failed to connect to backend."));
  }, []);

  const fetchForecast = (area, element) => {
    axios.get(`${API_URL}/forecast`, { params: { area, element } }).then(res => setForecastData(res.data));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/predict`, formData);
      setPrediction(response.data);
      fetchForecast(formData.Area, formData.Element);

      const newEntry = {
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          area: formData.Area,
          element: formData.Element,
          year: formData.Year,
          prediction: response.data.prediction,
          insight: response.data.insight
      };
      const updatedHistory = [newEntry, ...history].slice(0, 20); // Keep last 20
      setHistory(updatedHistory);
      localStorage.setItem('ghg_prediction_history', JSON.stringify(updatedHistory));

    } finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, 297, 'F');
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("Global GHG Emissions Intelligence System", 15, 25);
      
      pdf.setFontSize(14);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Official Forecast Assessment Report", 15, 33);
      
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(15, 40, pageWidth - 15, 40);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, 47);
      pdf.text(`Model Accuracy: 99.3% R2 Score`, pageWidth - 70, 47);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("Assessment Target", 15, 60);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Geography: ${formData.Area}`, 15, 68);
      pdf.text(`Analyzed Element: ${formData.Element}`, 15, 75);
      pdf.text(`Forecast Horizon Year: ${formData.Year}`, 15, 82);
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("Executive Summary", 15, 95);
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(51, 65, 85);
      const summaryText = `Based on historical patterns dating back to 1990, the machine learning model projects that ${formData.Element.split('(')[1]?.replace(')', '') || 'emissions'} in ${formData.Area} will reach approximately ${prediction?.prediction?.toLocaleString(undefined, {maximumFractionDigits: 1})} kilotonnes by the year ${formData.Year}.`;
      
      const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 30);
      pdf.text(splitSummary, 15, 103);

      let threatY = 103 + (splitSummary.length * 6) + 10;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("Risk & Threat Level Assessment", 15, threatY);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      
      if (insight === 'High') pdf.setTextColor(239, 68, 68);
      else if (insight === 'Medium') pdf.setTextColor(245, 158, 11);
      else pdf.setTextColor(16, 185, 129);

      pdf.text(`Classification: ${insight ? insight.toUpperCase() : 'UNKNOWN'} EMISSION THREAT`, 15, threatY + 8);
      
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Trend vs Historic Baseline: ${trend2031}`, 15, threatY + 16);
      pdf.text(`Peak Historical Emission Record: ${peakEmission} kt (in ${peakYear})`, 15, threatY + 24);
      pdf.text(`Historical Average: ${avgHistorical} kt / year`, 15, threatY + 32);
      
      let currentY = threatY + 45;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(15, 23, 42);
      pdf.text("Analytical Visuals (Time-Series & Decadal)", 15, currentY);

      if (areaChartRef.current && barChartRef.current) {
        currentY += 5;
        const areaCanvas = await html2canvas(areaChartRef.current, { backgroundColor: '#0b1426', scale: 2 });
        const areaImgData = areaCanvas.toDataURL('image/png');
        const charWidth = pageWidth - 30;
        const areaRatio = areaCanvas.height / areaCanvas.width;
        const areaHeight = charWidth * areaRatio;

        pdf.addImage(areaImgData, 'PNG', 15, currentY, charWidth, areaHeight);
        currentY = currentY + areaHeight + 10;

        const barCanvas = await html2canvas(barChartRef.current, { backgroundColor: '#0b1426', scale: 2 });
        const barImgData = barCanvas.toDataURL('image/png');
        const barRatio = barCanvas.height / barCanvas.width;
        const barHeight = charWidth * barRatio;

        if (currentY + barHeight > 280) {
            pdf.addPage();
            currentY = 15;
        }

        pdf.addImage(barImgData, 'PNG', 15, currentY, charWidth, barHeight);
      }

      pdf.save(`Intelligence_Report_${formData.Area.replace(/[^a-zA-Z0-9]/g, '_')}_${formData.Year}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  const loadHistoryItem = (item) => {
      setFormData({ Area: item.area, Element: item.element, Year: item.year });
      setPrediction({ prediction: item.prediction, insight: item.insight });
      fetchForecast(item.area, item.element);
      setShowHistory(false);
  };

  let combinedChartData = [];
  if (forecastData.history.length > 0 && forecastData.forecast.length > 0) {
      const history = forecastData.history;
      const forecast = forecastData.forecast;
      const lastHistory = history[history.length - 1];
      
      history.forEach(d => {
          combinedChartData.push({ Year: d.Year, historyValue: d.Value, forecastValue: null, rawValue: d.Value });
      });
      
      // Connect lines by making the last historical point the start of the forecast line
      combinedChartData[combinedChartData.length - 1].forecastValue = lastHistory.Value;
      
      forecast.forEach(d => {
          combinedChartData.push({ Year: d.Year, historyValue: null, forecastValue: d.Value, rawValue: d.Value });
      });
  } else {
      const all = [...forecastData.history, ...forecastData.forecast];
      all.forEach(d => combinedChartData.push({ Year: d.Year, historyValue: d.Value, forecastValue: d.Value, rawValue: d.Value }));
  }

  const insight = prediction?.insight || "Low";
  let chartColor = "#22c55e"; // green matching screenshot
  if (insight === "Medium") chartColor = "#eab308"; // yellow
  if (insight === "High") chartColor = "#ef4444"; // red

  // Calculate Decade Averages for Bar Chart
  const decadeData = [];
  if (combinedChartData.length > 0) {
      const decades = ['1990s', '2000s', '2010s', '2020s'];
      decades.forEach(decade => {
          const startYear = parseInt(decade.substring(0, 4));
          const endYear = startYear + 9;
          const decadePoints = combinedChartData.filter(d => parseInt(d.Year) >= startYear && parseInt(d.Year) <= endYear);
          if (decadePoints.length > 0) {
              const avg = decadePoints.reduce((sum, d) => sum + parseFloat(d.rawValue || 0), 0) / decadePoints.length;
              decadeData.push({
                  name: decade,
                  avgValue: Math.round(avg),
                  isForecast: decade === '2020s'
              });
          }
      });
  }

  // Calculate Dynamic Metrics from forecastData
  let peakEmission = "---";
  let peakYear = "---";
  let avgHistorical = "---";
  let trend2031 = "---";
  const elLabel = formData.Element ? formData.Element.split('(')[1]?.replace(')', '') || formData.Element : "CO₂e";
  const formatGas = (gas) => {
    if (!gas) return "CO₂e";
    const g = gas.toUpperCase();
    if (g === 'CH4') return 'CH₄';
    if (g === 'N2O') return 'N₂O';
    if (g === 'CO2') return 'CO₂';
    return gas;
  };
  const formattedGas = formatGas(elLabel);

  if (forecastData.history && forecastData.history.length > 0) {
      const maxObj = forecastData.history.reduce((max, obj) => (parseFloat(obj.Value) > parseFloat(max.Value) ? obj : max), forecastData.history[0]);
      peakEmission = Math.round(maxObj.Value).toLocaleString();
      peakYear = maxObj.Year;

      const totalHist = forecastData.history.reduce((sum, obj) => sum + parseFloat(obj.Value), 0);
      avgHistorical = Math.round(totalHist / forecastData.history.length).toLocaleString();
  }

  if (forecastData.history && forecastData.forecast && forecastData.forecast.length > 0 && forecastData.history.length > 0) {
      const lastHist = parseFloat(forecastData.history[forecastData.history.length - 1].Value);
      const prediction2031 = parseFloat(forecastData.forecast[forecastData.forecast.length - 1].Value);
      if (lastHist > 0) {
          const percentChange = ((prediction2031 - lastHist) / lastHist) * 100;
          trend2031 = (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%";
      }
  }

  const cardOuterClass = "bg-[#0b1426] border border-sky-900/40 rounded-[28px] p-6 text-left shadow-2xl relative overflow-hidden flex flex-col justify-center transition-all";
  
  return (
    <div className="min-h-screen bg-[#030914] text-white p-6 md:p-8 font-sans selection:bg-sky-500/30 relative flex flex-col items-center pb-24">
      <AnimatedBackground />
      
      <div className="max-w-[1500px] w-full mx-auto space-y-6 relative z-10 pt-2">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 pl-2">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-bold tracking-[0.2em] uppercase">
            <ArrowLeft className="w-5 h-5 opacity-60" /> <span className="mt-[2px]">Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
              <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-6 py-2 rounded-full border border-sky-500/10 bg-[#09152b] hover:bg-[#0ea5e9]/10 text-sky-400 text-[9px] font-bold tracking-[0.2em] uppercase transition-colors shadow-lg">
                  <History className="w-3.5 h-3.5" /> History
              </button>
              {prediction && (
                 <button onClick={downloadPDF} className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#0ea5e9] hover:bg-sky-400 text-[#030914] text-[9px] font-black tracking-[0.2em] uppercase transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                     <Download className="w-3.5 h-3.5" /> Export PDF
                 </button>
              )}
              <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-sky-500/10 bg-[#09152b] shadow-lg ml-2 hidden md:flex">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse" />
                <span className="text-cyan-400 text-[9px] font-bold tracking-[0.2em] uppercase mt-[1px]">GHG Console Active</span>
              </div>
          </div>
        </header>
        
        <div ref={reportRef} className="pb-8">

        {/* Top 4 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-6">
          <div className={cardOuterClass}>
            <div className="flex items-center mb-6 text-[#10b981]"><Activity className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">Peak Emission</p>
            <p className="text-[32px] font-black leading-none mb-2 text-white">{peakEmission}</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">kt {formattedGas} - Peak in {peakYear}</p>
          </div>
          
          <div className={cardOuterClass}>
            <div className="flex items-center mb-6 text-[#10b981]"><Clock className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">Avg Historical</p>
            <p className="text-[32px] font-black leading-none mb-2 text-white">{avgHistorical}</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">kt {formattedGas} per year</p>
          </div>

          <div className={cardOuterClass}>
            <div className="flex items-center mb-6 text-[#10b981]"><TrendingUp className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">2031 Trend</p>
            <p className={`text-[32px] font-black leading-none mb-2 ${trend2031.startsWith('-') ? 'text-emerald-400' : (trend2031.startsWith('+') ? 'text-rose-400' : 'text-white')}`}>{trend2031}</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">vs last historical</p>
          </div>

          <div className={cardOuterClass}>
            <div className="flex items-center mb-6 text-[#10b981]"><Target className="w-[18px] h-[18px]" strokeWidth={2.5}/></div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">Model R² Score</p>
            <p className="text-[32px] font-black leading-none mb-2 text-white">99.3%</p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Random Forest accuracy</p>
          </div>
        </div>

        {/* Bottom Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full min-h-[540px] pb-32">
          
          {/* Left Panel: Emission Parameters & Output */}
          <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#081223] border border-sky-900/30 rounded-[32px] p-8 flex flex-col relative shadow-2xl">
                  
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-8 h-8 rounded-full border border-sky-900/50 flex items-center justify-center bg-[#050b14]">
                          <Target className="w-[14px] h-[14px] text-[#0ea5e9]" />
                      </div>
                      <h3 className="text-[12px] font-black tracking-[0.2em] text-white uppercase">Emission Parameters</h3>
                  </div>

                  <form onSubmit={handlePredict} className="text-left relative z-10 flex flex-col justify-between h-full">
                      <div className="space-y-8">
                          <div className="space-y-3">
                              <label className="text-[9px] text-slate-500 tracking-[0.25em] font-bold uppercase block pl-1">Geography</label>
                              <div className="relative">
                                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0ea5e9]" />
                                  <select className="w-full bg-[#030914] border border-sky-900/40 rounded-[14px] p-[20px] pl-[52px] text-[13px] tracking-wide font-black outline-none text-white appearance-none transition-colors" value={formData.Area} onChange={(e) => setFormData({...formData, Area: e.target.value})}>
                                    {metadata.areas.map(a => <option key={a} value={a}>{a}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div className="space-y-3">
                              <label className="text-[9px] text-slate-500 tracking-[0.25em] font-bold uppercase block pl-1">Emission Element</label>
                              <div className="relative">
                                  <Wind className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0ea5e9]" />
                                  <select className="w-full bg-[#030914] border border-sky-900/40 rounded-[14px] p-[20px] pl-[52px] text-[13px] tracking-wide font-black outline-none text-white appearance-none transition-colors" value={formData.Element} onChange={(e) => setFormData({...formData, Element: e.target.value})}>
                                    {metadata.elements.map(e => <option key={e} value={e}>{e}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div className="space-y-3">
                              <label className="text-[9px] text-slate-500 tracking-[0.25em] font-bold uppercase block pl-1">Forecast Target Year</label>
                              <input type="number" className="w-full bg-[#030914] border border-sky-900/40 rounded-[14px] p-[20px] font-black text-[13px] tracking-wide outline-none text-white pl-6 transition-colors" value={formData.Year} onChange={(e) => setFormData({...formData, Year: e.target.value})} />
                          </div>
                      </div>
                      
                      <div className="w-full mt-8">
                          <button type="submit" className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black py-[22px] rounded-2xl flex justify-center items-center gap-4 tracking-[0.2em] text-[12px] uppercase transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 border border-emerald-400">
                            RUN PREDICTION <Zap className="w-[16px] h-[16px] fill-white text-white" />
                          </button>
                      </div>
                  </form>
              </div>

              {/* PROJECTED OUTPUT (Visible if prediction exists) */}
              <AnimatePresence>
                {prediction && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col">
                      <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500 mb-6 pl-2">Projected Output</p>
                      <div className="flex items-end gap-3 mb-6 pl-2">
                         <span className="text-[48px] font-black italic tracking-tighter text-white leading-none">
                            {prediction.prediction.toLocaleString(undefined, {maximumFractionDigits: 1})}
                         </span>
                         <span className="text-[11px] font-bold text-[#0ea5e9] tracking-[0.25em] uppercase mb-1">kt {formattedGas}</span>
                      </div>
                      
                      {/* Threat Level Pill */}
                      {insight === 'High' ? (
                         <div className="bg-[#1f0914] border border-red-500/40 px-6 py-5 rounded-2xl flex items-center gap-5 w-full shadow-lg">
                             <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
                             <span className="text-red-500 font-bold text-[12px] tracking-[0.2em] uppercase">High Emission Threat</span>
                         </div>
                      ) : insight === 'Medium' ? (
                         <div className="bg-[#1a140a] border border-amber-500/40 px-6 py-5 rounded-2xl flex items-center gap-5 w-full shadow-lg">
                             <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b] animate-pulse" />
                             <span className="text-amber-500 font-bold text-[12px] tracking-[0.2em] uppercase">Medium Emission Threat</span>
                         </div>
                      ) : (
                         <div className="bg-[#061f14] border border-emerald-500/40 px-6 py-5 rounded-2xl flex items-center gap-5 w-full shadow-lg">
                             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                             <span className="text-emerald-500 font-bold text-[12px] tracking-[0.2em] uppercase">Low Emission Threat</span>
                         </div>
                      )}
                   </motion.div>
                )}
              </AnimatePresence>
          </div>
          
          {/* Right Column: Dual Charts */}
          <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* TOP: Area Chart */}
              <div ref={areaChartRef} className="bg-[#0b1426] border border-sky-900/40 rounded-[32px] p-8 pt-6 relative shadow-2xl h-[400px] flex flex-col border-t-0 border-l-0">
                  <div className="w-full h-full absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#0b1426] to-[#040C1A] -z-10" />
                  
                  {prediction && insight === 'High' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-red-500/10 blur-[120px] pointer-events-none rounded-full" />}
                  
                  <div className="flex justify-between items-start mb-4 w-full pl-2">
                     <div className="flex items-center gap-8 pt-1 opacity-0">...</div> {/* Empty spacer for top spacing */}
                  </div>

                  <div className="flex-1 w-full relative z-10 -ml-4">
                     <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                             <defs>
                               <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={chartColor} stopOpacity={0.5}/>
                                 <stop offset="100%" stopColor={chartColor} stopOpacity={0}/>
                               </linearGradient>
                               <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="0%" stopColor={chartColor} stopOpacity={0.5}/>
                                 <stop offset="100%" stopColor={chartColor} stopOpacity={0}/>
                               </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
                             <XAxis dataKey="Year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} minTickGap={20} />
                             <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                             <Tooltip 
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#475569', strokeWidth: 1.5, strokeDasharray: '' }}
                             />
                             
                             {combinedChartData.length > 0 && (
                                <ReferenceLine x="2021" stroke={chartColor} strokeDasharray="4 4" strokeOpacity={0.8} />
                             )}
                             <Area type="monotone" dataKey="historyValue" stroke={chartColor} strokeWidth={4} fill="url(#historyGradient)" isAnimationActive={true} animationDuration={1000} activeDot={{ r: 6, fill: "#0f172a", stroke: chartColor, strokeWidth: 2 }} />
                             <Area type="monotone" dataKey="forecastValue" stroke={chartColor} strokeWidth={4} fill="url(#forecastGradient)" strokeDasharray="6 6" isAnimationActive={true} animationDuration={1000} activeDot={{ r: 6, fill: "#0f172a", stroke: chartColor, strokeWidth: 2 }} />
                         </AreaChart>
                     </ResponsiveContainer>
                  </div>
              </div>

              {/* BOTTOM: Bar Chart (DECADE AVERAGE EMISSIONS) */}
              <div ref={barChartRef} className="bg-[#0b1426] border border-sky-900/40 rounded-[32px] px-10 py-10 relative shadow-2xl h-[450px] flex flex-col border-t-0 border-l-0">
                  <div className="flex justify-between items-start mb-12 w-full">
                     <div className="text-left">
                        <h3 className="text-[14px] font-black tracking-[0.2em] uppercase text-white mb-2 shadow-sm">DECADE AVERAGE EMISSIONS</h3>
                        <p className="text-[11px] text-slate-500 tracking-wide font-medium">Average emission per decade — historical vs forecast period</p>
                     </div>
                     <div className="border border-emerald-900/30 rounded-[14px] px-6 py-3 bg-[#05111a] shadow-inner">
                        <span className="text-emerald-500 text-[10px] font-bold tracking-[0.2em] uppercase hover:text-emerald-400 transition-colors cursor-default">kt {formattedGas}</span>
                     </div>
                  </div>

                  <div className="flex-1 w-full relative z-10 -ml-4 mt-8">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={decadeData} margin={{ top: 25, right: 0, left: 0, bottom: 0 }} barSize={42}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.15} />
                             <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} dy={15} />
                             <YAxis stroke="#475569" fontSize={11} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                             <Tooltip cursor={{fill: '#1e293b', opacity: 0.3}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} itemStyle={{ color: '#cbd5e1' }} formatter={(value) => [value, "Average"]} />
                             <Bar dataKey="avgValue" radius={[4, 4, 0, 0]}>
                                 <LabelList dataKey="avgValue" position="top" fill="#cbd5e1" fontSize={10} fontWeight="900" offset={10} />
                                 {
                                   decadeData.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={entry.isForecast ? chartColor : '#0ea5e9'} />
                                   ))
                                 }
                             </Bar>
                         </BarChart>
                     </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center gap-10 pt-10 pl-4 w-full border-t border-sky-900/20 mt-2">
                     <div className="flex items-center gap-3">
                        <div className="w-4 h-3 rounded-[3px] bg-[#0ea5e9]"/> 
                        <span className="text-[10px] tracking-[0.2em] text-slate-400 font-bold uppercase mt-[1px]">HISTORICAL AVG</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-4 h-3 rounded-[3px]" style={{ backgroundColor: chartColor }}/> 
                        <span className="text-[10px] tracking-[0.2em] text-slate-400 font-bold uppercase mt-[1px]">FORECAST AVG (2020S)</span>
                     </div>
                  </div>
              </div>

          </div>
          
        </div> {/* End Bottom Split Layout */}
      </div> {/* End reportRef */}
    </div> {/* End max-w-[1500px] */}

      {/* HISTORY PANEL MODAL/SLIDEOUT */}
      <AnimatePresence>
          {showHistory && (
             <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-[#040c18] border-l border-sky-900/40 z-50 p-6 shadow-2xl overflow-y-auto">
                    <div className="flex justify-between items-center mb-8 border-b border-sky-900/40 pb-4">
                        <h2 className="text-xl font-black text-white flex items-center gap-3"><History className="text-[#0ea5e9]" /> Prediction History</h2>
                        <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">No past predictions found.</div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} onClick={() => loadHistoryItem(item)} className="bg-[#0b1426] border border-sky-900/40 p-4 rounded-2xl cursor-pointer hover:border-[#0ea5e9]/50 hover:bg-[#0d1b32] transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{item.area}</span>
                                            <span className="text-slate-400 text-[11px] font-medium">{item.element}</span>
                                        </div>
                                        <span className="text-[#0ea5e9] font-black">{item.year}</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-4">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.timestamp}</span>
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${
                                                item.insight === 'High' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 
                                                item.insight === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 
                                                'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                            }`}>{item.insight}</span>
                                            <span className="text-sm font-black text-white">{item.prediction.toLocaleString(undefined, {maximumFractionDigits: 1})}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
             </>
          )}
      </AnimatePresence>

    </div>
  );
};

export default Predictor;
