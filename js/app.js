// Main Application Logic
let DATA = null;
let NETWORK_DATA = null;

document.addEventListener('DOMContentLoaded', async () => {
    DATA = await loadExperimentData();
    NETWORK_DATA = generateNetworkData(DATA.agents, DATA.networkConfig);
    
    initExperimentInfo();
    initAgentPreview();
    initInteractionSection();
    initAttitudeChart();
    initReasonsSection();
    initNetworkVisualization();
    initNavigation();
    initSimulation();
});

// 显示实验信息
function initExperimentInfo() {
    const info = DATA.experiment_info;
    document.querySelector('.nav-brand').innerHTML = 
        `🧠 ${info.name || 'Belief Dynamics Platform'}`;
    
    // 显示实验元数据
    if (DATA.metadata && Object.keys(DATA.metadata).length > 0) {
        const meta = DATA.metadata;
        const statusEl = document.getElementById('sim-status');
        if (statusEl) {
            statusEl.innerHTML = `
                条件: ${meta.personalityCondition || '-'} | 
                网络: ${meta.networkCondition || '-'} | 
                记忆: ${meta.memoryCondition || '-'} | 
                智能体: ${meta.numAgents || DATA.agents.length}
            `;
        }
    }
}

// 导航高亮
function initNavigation() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// 智能体预览 - 显示认知建模信息
function initAgentPreview() {
    const container = document.getElementById('agent-preview');
    const agents = DATA.agents;
    
    container.innerHTML = agents.map(agent => {
        const profile = agent.profile || {};
        const conformity = profile.socialTendency?.conformity;
        const trust = profile.socialTendency?.trustLevel;
        
        return `
            <div class="agent-card-mini" title="${formatPersonalityProfile(profile)}">
                <div class="name">${agent.name}</div>
                <div class="score">${agent.occupation}</div>
                ${conformity ? `<div class="score" style="color: #818cf8;">从众: ${(conformity * 100).toFixed(0)}%</div>` : ''}
            </div>
        `;
    }).join('');
}

// 仿真控制
function initSimulation() {
    const btn = document.getElementById('run-simulation');
    const progress = document.getElementById('sim-progress');
    const status = document.getElementById('sim-status');
    const originalStatus = status.innerHTML;
    
    btn.addEventListener('click', () => {
        btn.disabled = true;
        let p = 0;
        status.textContent = '正在初始化智能体...';
        
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                status.innerHTML = `✓ 仿真完成！共${DATA.maxRound + 1}轮交互<br><small>${originalStatus}</small>`;
                btn.disabled = false;
            } else if (p > 80) {
                status.textContent = '正在生成结果报告...';
            } else if (p > 50) {
                status.textContent = `正在执行第 ${Math.floor(p / 10)} 轮交互...`;
            } else if (p > 20) {
                status.textContent = '正在建立网络连接...';
            }
            progress.style.width = p + '%';
        }, 300);
    });
}

// LLM交互展示
function initInteractionSection() {
    const slider = document.getElementById('round-slider');
    const display = document.getElementById('round-display');
    const grid = document.getElementById('interaction-grid');
    
    slider.max = DATA.maxRound;
    
    function updateInteractions(round) {
        display.textContent = `Round ${round}`;
        const responses = DATA.responses[round] || [];
        
        grid.innerHTML = responses.map(r => {
            // 查找智能体的认知建模信息
            const agent = DATA.agents.find(a => a.name === r.agent_name);
            const profile = agent?.profile;
            const conformity = profile?.socialTendency?.conformity;
            
            return `
                <div class="interaction-card">
                    <div class="interaction-header">
                        <span class="agent-name">
                            ${r.agent_name}
                            ${conformity ? `<small style="color: #94a3b8;">(从众: ${(conformity * 100).toFixed(0)}%)</small>` : ''}
                        </span>
                        <span class="attitude-badge">态度: ${r.attitude_score}</span>
                    </div>
                    <div class="response-text">
                        <strong>回应:</strong> ${r.response_to_others || '无响应'}
                    </div>
                    <div class="response-text" style="margin-top: 0.5rem; color: #818cf8;">
                        <strong>原因:</strong> ${r.change_reason || '无'}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    slider.addEventListener('input', (e) => updateInteractions(parseInt(e.target.value)));
    updateInteractions(0);
}


// 态度变化图表
function initAttitudeChart() {
    const ctx = document.getElementById('attitude-chart').getContext('2d');
    const legendContainer = document.getElementById('attitude-legend');
    
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
        '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
        '#ec4899', '#f43f5e', '#78716c', '#64748b', '#475569'
    ];
    
    const labels = Array.from({ length: DATA.maxRound + 1 }, (_, i) => `R${i}`);
    
    const datasets = Object.entries(DATA.attitude_scores).map(([name, scores], i) => ({
        label: name,
        data: scores,
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length] + '20',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
    }));
    
    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' },
                    title: { display: true, text: '轮次', color: '#94a3b8' }
                },
                y: {
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' },
                    title: { display: true, text: '态度分数', color: '#94a3b8' },
                    min: 0,
                    max: 100
                }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
    
    // 图例显示智能体名称和从众性
    legendContainer.innerHTML = Object.keys(DATA.attitude_scores).map((name, i) => {
        const agent = DATA.agents.find(a => a.name === name);
        const conformity = agent?.profile?.socialTendency?.conformity;
        return `
            <div class="legend-item" title="${formatPersonalityProfile(agent?.profile)}">
                <div class="legend-color" style="background: ${colors[i % colors.length]}"></div>
                <span>${name}${conformity ? ` (${(conformity * 100).toFixed(0)}%)` : ''}</span>
            </div>
        `;
    }).join('');
}

// 变化原因展示
function initReasonsSection() {
    const select = document.getElementById('agent-select');
    const timeline = document.getElementById('reasons-timeline');
    
    // 下拉框显示智能体信息
    select.innerHTML = DATA.agents.map(agent => {
        const conformity = agent.profile?.socialTendency?.conformity;
        return `<option value="${agent.name}">${agent.name} - ${agent.occupation}${conformity ? ` (从众: ${(conformity * 100).toFixed(0)}%)` : ''}</option>`;
    }).join('');
    
    function updateReasons(agentName) {
        const reasons = DATA.change_reasons[agentName] || [];
        const agent = DATA.agents.find(a => a.name === agentName);
        
        // 显示智能体详细信息
        let headerHtml = '';
        if (agent && agent.profile) {
            headerHtml = `
                <div class="agent-profile-card" style="background: var(--bg-dark); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <strong>${agent.name}</strong> | ${agent.age}岁 | ${agent.occupation}<br>
                    <small style="color: #94a3b8;">${formatPersonalityProfile(agent.profile)}</small>
                </div>
            `;
        }
        
        timeline.innerHTML = headerHtml + reasons.map(r => {
            const isDecrease = r.from !== null && r.to < r.from;
            return `
                <div class="reason-card">
                    <div class="reason-header">
                        <span class="round-badge">Round ${r.round}</span>
                        <div class="score-change ${isDecrease ? 'decrease' : ''}">
                            ${r.from !== null ? `<span class="from">${r.from}</span><span class="arrow">→</span>` : ''}
                            <span class="to">${r.to}</span>
                        </div>
                    </div>
                    <div class="reason-text">${r.reason}</div>
                </div>
            `;
        }).join('');
    }
    
    select.addEventListener('change', (e) => updateReasons(e.target.value));
    if (DATA.agents.length > 0) {
        updateReasons(DATA.agents[0].name);
    }
}

// 网络拓扑可视化
function initNetworkVisualization() {
    const svg = d3.select('#network-svg');
    const container = document.getElementById('network-viz');
    const buttons = document.querySelectorAll('.network-controls button');
    
    let currentNetwork = 'full';
    
    // 根据实验配置高亮当前网络类型
    const networkCondition = DATA.metadata?.networkCondition;
    if (networkCondition) {
        buttons.forEach(btn => {
            if (btn.dataset.network === networkCondition || 
                (networkCondition === 'full' && btn.dataset.network === 'full')) {
                btn.classList.add('active');
                currentNetwork = btn.dataset.network;
            }
        });
    }
    
    function drawNetwork(networkType) {
        svg.selectAll('*').remove();
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        const data = JSON.parse(JSON.stringify(NETWORK_DATA[networkType]));
        
        // 根据从众性设置节点颜色
        const colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
            .domain([0.9, 0.1]); // 高从众红色，低从众绿色
        
        const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(d => d.id).distance(networkType === 'full' ? 80 : 100))
            .force('charge', d3.forceManyBody().strength(networkType === 'full' ? -100 : -200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));
        
        const link = svg.append('g')
            .selectAll('line')
            .data(data.links)
            .join('line')
            .attr('class', 'link')
            .attr('stroke-width', networkType === 'full' ? 0.5 : 1.5);
        
        const node = svg.append('g')
            .selectAll('g')
            .data(data.nodes)
            .join('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        
        node.append('circle')
            .attr('r', 20)
            .attr('fill', d => {
                const agent = DATA.agents.find(a => a.name === d.name);
                const conformity = agent?.profile?.socialTendency?.conformity;
                return conformity ? colorScale(conformity) : '#6366f1';
            });
        
        node.append('text')
            .text(d => d.name.slice(0, 2))
            .attr('dy', 4);
        
        node.append('title').text(d => {
            const agent = DATA.agents.find(a => a.name === d.name);
            if (agent) {
                return `${d.name}\n${agent.occupation}\n${formatPersonalityProfile(agent.profile)}`;
            }
            return d.name;
        });
        
        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });
        
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
    }
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentNetwork = btn.dataset.network;
            drawNetwork(currentNetwork);
        });
    });
    
    if (!document.querySelector('.network-controls button.active')) {
        buttons[0].classList.add('active');
    }
    drawNetwork(currentNetwork);
    
    window.addEventListener('resize', () => drawNetwork(currentNetwork));
}
