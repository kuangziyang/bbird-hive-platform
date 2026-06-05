"use client";

import { useState } from "react";
import { IconWand, IconX } from "./Icon";
import { toast } from "./Toast";

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (input: { name: string; description: string; model: string; mcps: string[]; skills: string[] }) => void;
  onSaveDraft: (input: { name: string; description: string }) => void;
}

const MODELS = ["gpt-4o", "claude-sonnet-4", "deepseek-chat", "qwen-max"];
const MCPS = ["openai", "notion", "slack", "github", "hubspot", "metabase"];
const SKILL_PRESETS = ["web_search", "code_review", "pdf_reader", "sql_query", "image_gen"];

export function CreateAgentModal({ open, onClose, onPublish, onSaveDraft }: CreateAgentModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [mcps, setMcps] = useState<string[]>(["openai"]);
  const [skills, setSkills] = useState<string>("");

  if (!open) return null;

  function toggleMcp(m: string) {
    setMcps((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]));
  }

  function publish() {
    if (!name.trim()) {
      toast("请先输入名称");
      return;
    }
    onPublish({
      name: name.trim(),
      description: desc.trim() || "未提供描述",
      model,
      mcps: mcps.length ? mcps : ["openai"],
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setName("");
    setDesc("");
    setSkills("");
  }

  function saveDraft() {
    onSaveDraft({ name: name.trim() || "未命名智能体", description: desc.trim() || "草稿" });
    setName("");
    setDesc("");
    setSkills("");
  }

  return (
    <div className="modal-backdrop is-open" role="dialog" aria-modal="true" aria-labelledby="createAgentTitle" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: "min(620px, 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 id="createAgentTitle">创建智能体</h2>
            <p className="sub">配置名称、模型、依赖的 MCP 服务器和技能，发布后即可在工作台使用。</p>
          </div>
          <button className="btn btn-ghost" type="button" onClick={onClose} aria-label="关闭">
            <IconX size={14} />
          </button>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <label htmlFor="agentName">名称</label>
          <input id="agentName" type="text" placeholder="例如：研究助理" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="agentDesc">描述</label>
          <textarea id="agentDesc" rows={2} placeholder="一句话说明这个智能体能做什么" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="agentModel">主模型</label>
          <select id="agentModel" value={model} onChange={(e) => setModel(e.target.value)}>
            {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="field">
          <label>引用的 MCP</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {MCPS.map((m) => {
              const on = mcps.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  className="filter-pill"
                  aria-pressed={on}
                  onClick={() => toggleMcp(m)}
                  style={{
                    padding: "5px 10px",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    background: on ? "var(--accent-soft)" : "var(--surface-2)",
                    color: on ? "var(--accent-fg)" : "var(--muted)",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label htmlFor="agentSkills">技能（逗号分隔）</label>
          <input id="agentSkills" type="text" placeholder={`例如：${SKILL_PRESETS.slice(0, 3).join(", ")}`} value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
          <button type="button" className="btn btn-secondary" onClick={saveDraft}>
            <IconWand size={14} /> 保存草稿
          </button>
          <button type="button" className="btn btn-primary" onClick={publish}>发布</button>
        </div>
      </div>
    </div>
  );
}
