function createViolinPlot(data, title, divId) {
    const traces = [];
    
    // Add violin plots for Mock and ABA
    ['Mock', 'ABA'].forEach(treatment => {
        const treatmentData = data.filter(d => d.treatment === treatment);
        traces.push({
            type: 'violin',
            x: treatmentData.map(d => treatment),
            y: treatmentData.map(d => parseFloat(d.Ave_RLN)),
            name: treatment,
            side: 'positive',
            points: false,
            box: {
                visible: true
            },
            line: {
                color: colors[treatment],
                width: 2
            },
            fillcolor: colors[treatment],
            opacity: 0.6,
            meanline: {
                visible: true
            }
        });
    });

    // Add connecting lines between treatments for each Accession_ID
    const accessions = [...new Set(data.map(d => d.Accession_ID))];
    accessions.forEach(accession => {
        const accessionData = data.filter(d => d.Accession_ID === accession);
        if (accessionData.length === 2) {
            traces.push({
                type: 'scatter',
                x: accessionData.map(d => d.treatment),
                y: accessionData.map(d => parseFloat(d.Ave_RLN)),
                mode: 'lines+markers',
                line: {
                    color: 'rgba(128, 128, 128, 0.3)',
                    width: 1
                },
                marker: {
                    color: 'black',
                    size: 4
                },
                showlegend: false,
                hoverinfo: 'none'
            });
        }
    });

    const layout = {
        title: {
            text: title,
            font: { size: 24 }
        },
        xaxis: {
            title: 'Treatment',
            titlefont: { size: 18 }
        },
        yaxis: {
            title: 'Ave_RLN',
            range: [0, 175],
            titlefont: { size: 18 }
        },
        violinmode: 'overlay',
        showlegend: true,
        width: 800,
        height: 600
    };

    return Plotly.newPlot(divId, traces, layout);
}

function createBeeswarmPlot(data, title, divId) {
    const traces = [];
    
    ['Mock', 'ABA'].forEach(treatment => {
        const treatmentData = data.filter(d => d.treatment === treatment);
        traces.push({
            type: 'box',
            x: treatmentData.map(d => treatment),
            y: treatmentData.map(d => parseFloat(d.Ave_RLN)),
            name: treatment,
            boxpoints: 'all',
            jitter: 0.3,
            pointpos: 0,
            marker: {
                color: colors[treatment],
                size: 5,
                opacity: 0.7
            },
            line: {
                color: colors[treatment]
            },
            fillcolor: 'transparent'
        });
    });

    const layout = {
        title: {
            text: title,
            font: { size: 24 }
        },
        xaxis: {
            title: 'Treatment',
            titlefont: { size: 18 }
        },
        yaxis: {
            title: 'Ave_RLN',
            range: [0, 175],
            titlefont: { size: 18 }
        },
        boxmode: 'group',
        width: 800,
        height: 600
    };

    return Plotly.newPlot(divId, traces, layout);
}