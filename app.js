/**
 * Auto Company Data Query Tool - Frontend Application
 */

// ==================== Configuration ====================
const DATA_BASE = './data/';

// ==================== State ====================
let companyData = [];
let recruitmentData = [];
let dashboardData = {};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadDashboardData();
    loadCompanyList();
});

// ==================== Tab System ====================
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });
}

// ==================== Data Loading ====================
async function loadDashboardData() {
    try {
        const resp = await fetch(`${DATA_BASE}dashboard_data.json`);
        if (resp.ok) {
            dashboardData = await resp.json();
            updateStats();
        }
    } catch (e) {
        console.log('Dashboard data not yet available, using defaults');
        loadUpdateSummary();
    }
}

async function loadUpdateSummary() {
    try {
        const resp = await fetch(`${DATA_BASE}update_summary.json`);
        if (resp.ok) {
            const summary = await resp.json();
            document.getElementById('last-update').textContent =
                `Last update: ${summary.last_update || 'N/A'}`;
        }
    } catch (e) {
        document.getElementById('last-update').textContent = 'Last update: Pending first run';
    }
}

async function loadCompanyList() {
    try {
        const resp = await fetch(`${DATA_BASE}company_list.csv`);
        if (resp.ok) {
            const text = await resp.text();
            companyData = parseCSV(text);
            renderCompanyTable(companyData);
            populateFilters();
            updateCompanyStats();
        }
    } catch (e) {
        console.error('Failed to load company list:', e);
        document.getElementById('company-tbody').innerHTML =
            '<tr><td colspan="8" style="text-align:center;padding:40px;">⏳ Data not yet available. Please run the collection workflow first.</td></tr>';
    }
}

async function loadRecruitmentData() {
    const tbody = document.getElementById('recruitment-tbody');
    tbody.innerHTML = '<tr><td colspan="7"><div class="loading"></div></td></tr>';

    try {
        const resp = await fetch(`${DATA_BASE}dashboard_data.json`);
        if (resp.ok) {
            const data = await resp.json();
            document.getElementById('stat-jobs').textContent = (data.total_jobs || 0).toLocaleString();
        }
    } catch (e) {}

    // Try loading recruitment CSV files
    try {
        const files = ['全部车企招聘数据'];
        for (const fname of files) {
            const resp = await fetch(`${DATA_BASE}${fname}.csv`);
            if (resp.ok) {
                const text = await resp.text();
                recruitmentData = parseCSV(text);
                renderRecruitmentTable(recruitmentData);
                populateJobFilters();
                return;
            }
        }
    } catch (e) {}

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">⏳ Recruitment data not yet available.</td></tr>';
}

// ==================== CSV Parser ====================
function parseCSV(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const obj = {};
        headers.forEach((h, idx) => {
            obj[h.trim()] = (values[idx] || '').trim();
        });
        data.push(obj);
    }
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

// ==================== Rendering ====================
function renderCompanyTable(data) {
    const tbody = document.getElementById('company-tbody');
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">No data</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((row, i) => {
        const category = row['类别'] || '';
        const tagClass = getCategoryClass(category);
        const listed = row['是否上市'] === '是';
        const priority = row['数据获取优先级'] || '';
        const priorityClass = priority === '高' ? 'priority-high' : priority === '中' ? 'priority-medium' : 'priority-low';

        return `<tr>
            <td>${i + 1}</td>
            <td><strong>${row['企业名称'] || ''}</strong></td>
            <td><span class="tag ${tagClass}">${category}</span></td>
            <td><span class="${listed ? 'status-yes' : 'status-no'}">${listed ? '✅ 已上市' : '—'}</span></td>
            <td>${row['上市交易所'] || '—'}</td>
            <td><code>${row['股票代码'] || '—'}</code></td>
            <td>${row['总部所在地'] || '—'}</td>
            <td><span class="${priorityClass}">${priority}</span></td>
        </tr>`;
    }).join('');
}

function renderRecruitmentTable(data) {
    const tbody = document.getElementById('recruitment-tbody');
    if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">No data</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((row, i) => `<tr>
        <td>${i + 1}</td>
        <td><strong>${row['company_name'] || row['企业名称'] || ''}</strong></td>
        <td>${row['job_title'] || row['岗位名称'] || ''}</td>
        <td>${row['work_location'] || row['工作地点'] || ''}</td>
        <td><code>${row['salary_range'] || row['薪资范围'] || ''}</code></td>
        <td>${row['education_required'] || row['学历要求'] || ''}</td>
        <td>${row['source_platform'] || row['来源平台'] || ''}</td>
    </tr>`).join('');
}

// ==================== Stats Update ====================
function updateStats() {
    document.getElementById('last-update').textContent =
        `Last update: ${dashboardData.last_update || 'N/A'}`;
    document.getElementById('stat-companies').textContent =
        (dashboardData.total_companies || 0).toLocaleString();
    document.getElementById('stat-listed').textContent =
        (dashboardData.companies || []).filter(c => c.listed).length;
    document.getElementById('stat-jobs').textContent =
        (dashboardData.total_jobs || 0).toLocaleString();

    let fileCount = 0;
    ['financial', 'recruitment', 'enterprise'].forEach(k => {
        fileCount += dashboardData[`${k}_count`] || 0;
    });
    document.getElementById('stat-files').textContent = fileCount;
}

function updateCompanyStats() {
    document.getElementById('stat-companies').textContent = companyData.length;
    document.getElementById('stat-listed').textContent =
        companyData.filter(c => c['是否上市'] === '是').length;
}

// ==================== Filters ====================
function populateFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const listedFilter = document.getElementById('listed-filter');

    // Category filter already set in HTML, just bind events
    categoryFilter.addEventListener('change', filterCompanies);
    listedFilter.addEventListener('change', filterCompanies);
    document.getElementById('company-search').addEventListener('input', filterCompanies);

    // Populate financial company dropdown
    const financialSelect = document.getElementById('financial-company');
    companyData.filter(c => c['是否上市'] === '是').forEach(c => {
        const opt = document.createElement('option');
        opt.value = c['企业名称'];
        opt.textContent = `${c['企业名称']} (${c['股票代码'] || ''})`;
        financialSelect.appendChild(opt);
    });
}

function populateJobFilters() {
    const jobCompanyFilter = document.getElementById('job-company-filter');
    const companies = [...new Set(recruitmentData.map(r => r['company_name'] || r['企业名称']))];
    companies.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        jobCompanyFilter.appendChild(opt);
    });
    jobCompanyFilter.addEventListener('change', filterJobs);
    document.getElementById('job-search').addEventListener('input', filterJobs);
}

function filterCompanies() {
    const search = document.getElementById('company-search').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const listed = document.getElementById('listed-filter').value;

    const filtered = companyData.filter(row => {
        const matchSearch = !search || (row['企业名称'] || '').toLowerCase().includes(search);
        const matchCategory = !category || (row['类别'] || '') === category;
        const matchListed = !listed || (row['是否上市'] || '') === listed;
        return matchSearch && matchCategory && matchListed;
    });

    renderCompanyTable(filtered);
}

function filterJobs() {
    const search = document.getElementById('job-search').value.toLowerCase();
    const company = document.getElementById('job-company-filter').value;

    const filtered = recruitmentData.filter(row => {
        const matchSearch = !search || (row['job_title'] || row['岗位名称'] || '').toLowerCase().includes(search);
        const matchCompany = !company || (row['company_name'] || row['企业名称'] || '') === company;
        return matchSearch && matchCompany;
    });

    renderRecruitmentTable(filtered);
}

// ==================== Helpers ====================
function getCategoryClass(category) {
    if (category.includes('传统')) return 'tag-traditional';
    if (category.includes('新势力') || category.includes('新能源')) return 'tag-new-energy';
    if (category.includes('商用车')) return 'tag-commercial';
    if (category.includes('合资')) return 'tag-joint';
    return 'tag-traditional';
}

// Load recruitment data when tab is clicked
document.querySelector('[data-tab="recruitment"]')?.addEventListener('click', () => {
    if (!recruitmentData.length) loadRecruitmentData();
});
