// 数据加载和处理模块
// 从两个文件加载实验数据：
// - experiment_config.json: 智能体认知建模信息
// - llm_responses.json: LLM响应和态度变化数据

let CONFIG_DATA = null;
let RESPONSE_DATA = null;
let PROCESSED_DATA = null;

// 加载所有数据
async function loadExperimentData() {
    try {
        const [configRes, responseRes] = await Promise.all([
            fetch('data/experiment_config.json'),
            fetch('data/llm_responses.json')
        ]);
        
        if (!configRes.ok || !responseRes.ok) {
            throw new Error('数据文件加载失败');
        }
        
        CONFIG_DATA = await configRes.json();
        RESPONSE_DATA = await responseRes.json();
        PROCESSED_DATA = processData(CONFIG_DATA, RESPONSE_DATA);
        return PROCESSED_DATA;
    } catch (error) {
        console.error('加载数据失败:', error);
        return getSampleData();
    }
}

// 处理原始数据为展示所需格式
function processData(config, responses) {
    const responseList = responses.responses || [];
    
    // 从配置文件提取智能体信息
    const agents = (config.agents || []).map((agent, idx) => ({
        id: idx,
        name: agent.name,
        age: agent.age,
        occupation: agent.occupation,
        personality: agent.personality,
        profile: agent.personalityProfile
    }));
    
    // 创建名字到ID的映射
    const nameToId = {};
    agents.forEach(a => nameToId[a.name] = a.id);
    
    // 获取最大轮次
    const maxRound = Math.max(...responseList.map(r => r.round), 0);
    
    // 按轮次组织响应
    const responsesByRound = [];
    for (let round = 0; round <= maxRound; round++) {
        responsesByRound.push(
            responseList.filter(r => r.round === round)
                .sort((a, b) => (nameToId[a.agent_name] || 0) - (nameToId[b.agent_name] || 0))
        );
    }
    
    // 提取态度分数时间序列
    const attitudeScores = {};
    agents.forEach(agent => {
        attitudeScores[agent.name] = [];
        for (let round = 0; round <= maxRound; round++) {
            const record = responseList.find(r => r.agent_name === agent.name && r.round === round);
            attitudeScores[agent.name].push(record ? record.attitude_score : null);
        }
    });
    
    // 提取变化原因
    const changeReasons = {};
    agents.forEach(agent => {
        const agentResponses = responseList
            .filter(r => r.agent_name === agent.name)
            .sort((a, b) => a.round - b.round);
        
        changeReasons[agent.name] = agentResponses.map((r, idx) => ({
            round: r.round,
            from: idx > 0 ? agentResponses[idx - 1].attitude_score : null,
            to: r.attitude_score,
            reason: r.change_reason || '无'
        }));
    });
    
    return {
        experiment_info: {
            name: config.name || responses.experiment_info?.name || '社会影响力实验',
            description: responses.experiment_info?.description || '',
            created_at: responses.experiment_info?.created_at || new Date().toISOString()
        },
        news: config.news || null,
        metadata: config.experimentMetadata || {},
        networkConfig: config.networkConfig || {},
        agents,
        responses: responsesByRound,
        attitude_scores: attitudeScores,
        change_reasons: changeReasons,
        maxRound
    };
}

// 后备示例数据
function getSampleData() {
    return {
        experiment_info: {
            name: "社会影响力实验（示例数据）",
            description: "请上传 experiment_config.json 和 llm_responses.json 到 data 文件夹",
            created_at: new Date().toISOString()
        },
        news: null,
        metadata: {},
        networkConfig: {},
        agents: [
            { id: 0, name: "示例智能体", age: 30, occupation: "测试", personality: "balanced", profile: {} }
        ],
        responses: [[{ agent_id: 0, agent_name: "示例智能体", attitude_score: 50, change_reason: "示例", response_to_others: "示例响应" }]],
        attitude_scores: { "示例智能体": [50] },
        change_reasons: { "示例智能体": [{ round: 0, from: null, to: 50, reason: "示例数据" }] },
        maxRound: 0
    };
}


// 网络拓扑数据生成
function generateNetworkData(agents, networkConfig) {
    const nodes = agents.map((a, i) => ({ 
        id: a.id, 
        name: a.name, 
        group: Math.floor(i / 5) 
    }));
    
    const numAgents = agents.length;
    
    // 全连接网络
    const fullLinks = [];
    for (let i = 0; i < numAgents; i++) {
        for (let j = i + 1; j < numAgents; j++) {
            fullLinks.push({ source: i, target: j });
        }
    }
    
    // 小世界网络 (k=4)
    const swLinks = [];
    for (let i = 0; i < numAgents; i++) {
        for (let k = 1; k <= 2; k++) {
            swLinks.push({ source: i, target: (i + k) % numAgents });
        }
    }
    for (let i = 0; i < Math.floor(numAgents / 3); i++) {
        swLinks.push({ source: i, target: (i + Math.floor(numAgents / 2)) % numAgents });
    }
    
    // 稀疏链式网络
    const sparseLinks = [];
    for (let i = 0; i < numAgents - 1; i++) {
        sparseLinks.push({ source: i, target: i + 1 });
    }
    if (numAgents > 1) sparseLinks.push({ source: numAgents - 1, target: 0 });
    
    return {
        full: { nodes: JSON.parse(JSON.stringify(nodes)), links: fullLinks },
        small_world: { nodes: JSON.parse(JSON.stringify(nodes)), links: swLinks },
        sparse: { nodes: JSON.parse(JSON.stringify(nodes)), links: sparseLinks }
    };
}

// 格式化性格特征显示
function formatPersonalityProfile(profile) {
    if (!profile) return '';
    
    const items = [];
    
    if (profile.cognitiveStyle) {
        items.push(`思维: ${profile.cognitiveStyle.thinkingMode || '-'}`);
        items.push(`开放性: ${(profile.cognitiveStyle.openness * 100).toFixed(0)}%`);
    }
    
    if (profile.socialTendency) {
        items.push(`从众性: ${(profile.socialTendency.conformity * 100).toFixed(0)}%`);
        items.push(`信任度: ${(profile.socialTendency.trustLevel * 100).toFixed(0)}%`);
    }
    
    if (profile.emotionalProfile) {
        items.push(`情绪稳定: ${(profile.emotionalProfile.stability * 100).toFixed(0)}%`);
    }
    
    if (profile.valueStance) {
        items.push(`风险态度: ${profile.valueStance.riskAttitude || '-'}`);
    }
    
    return items.join(' | ');
}

// 导出
window.loadExperimentData = loadExperimentData;
window.generateNetworkData = generateNetworkData;
window.formatPersonalityProfile = formatPersonalityProfile;
