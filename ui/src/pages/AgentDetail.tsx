import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot } from 'lucide-react';
import axios from 'axios';
import {
  AgentHero,
  AgentQuote,
  AgentStats,
  AgentCapabilities,
  AgentPortfolio,
  AgentTestimonials,
  AgentTaskStarter,
  AgentAdvancedConfig
} from '../components/agents';
import { getAgentCategory } from '../lib/agentCategories';

export function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Agent basic info
  const [agent, setAgent] = useState<any>(null);
  
  // Profile data (from new API)
  const [profile, setProfile] = useState<any>(null);
  
  // Stats data (from new API)
  const [stats, setStats] = useState<any>(null);
  
  // Form data for advanced config
  const [formData, setFormData] = useState({
    identity: '',
    soul: '',
    tools: '',
    role: '',
    model: ''
  });

  useEffect(() => {
    fetchAgentData();
  }, [id]);

  const fetchAgentData = async () => {
    try {
      // Fetch basic agent info
      const agentRes = await axios.get(`http://localhost:3001/api/agents/${id}`);
      setAgent(agentRes.data);
      setFormData({
        identity: agentRes.data.identity || '',
        soul: agentRes.data.soul || '',
        tools: agentRes.data.tools || '',
        role: agentRes.data.role || '',
        model: agentRes.data.model || 'gemini-1.5-flash'
      });

      // Fetch profile data (new endpoint)
      const profileRes = await axios.get(`http://localhost:3001/api/agents/${id}/profile`);
      setProfile(profileRes.data);

      // Fetch stats data (new endpoint)
      const statsRes = await axios.get(`http://localhost:3001/api/agents/${id}/stats`);
      setStats(statsRes.data);

    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`http://localhost:3001/api/agents/${id}`, formData);
      await fetchAgentData();
      alert('Agent updated successfully!');
    } catch (error) {
      console.error('Failed to update agent:', error);
      alert('Failed to update agent.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to decommission ${agent.name}? This will remove all their memory.`)) return;
    try {
      await axios.delete(`http://localhost:3001/api/agents/${id}`);
      alert('Agent decommissioned.');
      navigate('/agents');
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to decommission agent.');
    }
  };

  const handleStartTask = (description: string) => {
    // Navigate to console with agent pre-selected
    navigate(`/console?agentId=${id}&task=${encodeURIComponent(description)}`);
  };

  const handleHire = () => {
    // TODO: Implement hire functionality (add agent to team)
    alert('Hire functionality coming soon! This will add the agent to your team.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!agent || !profile) {
    return <div className="text-white/50 text-center py-20">Agent not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Link
          to="/agents"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Agents</span>
        </Link>
      </div>

      {/* Hero Section */}
      <AgentHero
        name={agent.name}
        role={agent.role}
        categoryName={profile.categoryName}
        emoji={profile.emoji}
        status={agent.status}
        rating={stats?.rating || 4.9}
        reviewCount={stats?.reviewCount || 0}
        onHire={handleHire}
        onStartTask={() => document.getElementById('task-starter')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Quote Section */}
      <AgentQuote
        tagline={profile.tagline}
        agentName={agent.name}
      />

      {/* Two Column Layout: Stats + Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats */}
        <div className="lg:col-span-1">
          {stats && (
            <AgentStats
              completedTasks={stats.completedTasks}
              clientSatisfaction={stats.clientSatisfaction}
              avgDeliveryTime={stats.avgDeliveryTime}
              responseTime={stats.responseTime}
            />
          )}
        </div>

        {/* Right: Capabilities */}
        <div className="lg:col-span-2">
          <AgentCapabilities capabilities={profile.capabilities} />
        </div>
      </div>

      {/* Portfolio Section */}
      <AgentPortfolio portfolio={profile.portfolio} />

      {/* Testimonials Section */}
      <AgentTestimonials testimonials={profile.testimonials} />

      {/* Task Starter Section */}
      <div id="task-starter">
        <AgentTaskStarter
          agentName={agent.name}
          onSubmitTask={handleStartTask}
          quickStartTemplates={profile.quickStartTemplates}
        />
      </div>

      {/* Advanced Configuration (Collapsible) */}
      <AgentAdvancedConfig
        formData={formData}
        onChange={setFormData}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
      />
    </motion.div>
  );
}
