// Função de mudar a cor do site // 

function toggleMode() {
    document.documentElement.classList.toggle("light");
}


// Busca clima e gráfico via OPEN-METEO //

let chart = null;

async function buscarClima() {
    const cidade = document.getElementById("cityInput").value;
    if (!cidade) {
        alert("Digite uma cidade!");
        return;
    }

// Peguei lat/lon pela API gratuita do OPEN-METEO //

const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cidade}&count=1&language=pt&format=json`;
const geoResp = await fetch(geoURL);
const geoData = await geoResp.json();

    if (!geoData.results || geoData.results.length === 0) {
        alert("Cidade não encontrada!");
        return;
    }

const { latitude, longitude, name, country } = geoData.results[0];

const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`;

const resp = await fetch(url);
const data = await resp.json();

    renderClimaAtual(name, country, data);
    renderChart(data.daily.time, data.daily.temperature_2m_max);
    atualizarMapa(latitude, longitude);
}


//  Mostrar clima atual simples // 

function renderClimaAtual(cidade, pais, data) {
    const max = data.daily.temperature_2m_max[0];
    const min = data.daily.temperature_2m_min[0];

    document.getElementById("cidadeNome").textContent = `${cidade} - ${pais}`;
    document.getElementById("tempMax").innerHTML = `<strong>🌡️ Máx: ${max}°C</strong>`;
    document.getElementById("tempMin").innerHTML = `<strong>❄️ Mín: ${min}°C</strong>`;

    atualizarPrevisaoDias(data);
}

// Loop para mostrar todos os dias retornados pela API //

function atualizarPrevisaoDias(data) {
    let html = `
        <h2 id="dias" style="text-align: center; margin-top: 40px;"></h2>
        <div class="forecast-list">
    `;

    for (let i = 1; i < data.daily.time.length; i++) {
        html += `
            <div class="forecast-item">
                <p><strong>${data.daily.time[i]}</strong></p>
                <p>🌡️ Máx: ${data.daily.temperature_2m_max[i]}°C</p>
                <p>❄️ Mín: ${data.daily.temperature_2m_min[i]}°C</p>
            </div>
        `;
    }

    html += `</div>`;

    document.getElementById("weatherResult").innerHTML = html;
}


// Gráfico // 

function renderChart(labels, temps) {
    const ctx = document.getElementById("tempChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
    type: "line",
    data: {
        labels,
        datasets: [{
            label: "Temperatura Máx (°C)",
            data: temps,
            borderWidth: 2,
            borderColor: "blue",
            pointRadius: 3,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                labels: {
                    color: "white"   
                }
            }
        },

        scales: {
            x: {
                ticks: {
                    color: "white"
                },
                grid: {
                    color: "white"
                }
            },
            y: {
                ticks: {
                    color: "white"
                },
                grid: {
                    color: "white"
                }
            }
        }
    }
});
}

// Mapa com Leaflet.js //

let mapa;  
let marcador; 

function atualizarMapa(latitude, longitude) {
    if (!mapa) {
        mapa = L.map('map').setView([latitude, longitude], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(mapa);

        marcador = L.marker([latitude, longitude]).addTo(mapa);
    } else {
        mapa.setView([latitude, longitude], 10);
        marcador.setLatLng([latitude, longitude]);
    }
}

async function buscarClimaInicial(cidadePadrao) {
    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${cidadePadrao}&count=1&language=pt&format=json`;
    const geoResp = await fetch(geoURL);
    const geoData = await geoResp.json();

    if (!geoData.results || geoData.results.length === 0) {
        console.error("Cidade padrão não encontrada!");
        return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo`;

    const resp = await fetch(url);
    const data = await resp.json();

    // Atualiza tudo igual à busca normal
    renderClimaAtual(name, country, data);
    renderChart(data.daily.time, data.daily.temperature_2m_max);
    atualizarMapa(latitude, longitude);

    // Deixa o input já com Porto Alegre
    document.getElementById("cityInput").value = cidadePadrao;
}


window.onload = () => {
    buscarClimaInicial("Porto Alegre");
};