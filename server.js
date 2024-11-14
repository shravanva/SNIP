import express from 'express';
import fileUpload from 'express-fileupload';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(fileUpload());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.pheno_file || !req.files.snp_files) {
            return res.status(400).send('Please upload all required files');
        }

        const phenoFile = req.files.pheno_file;
        const snpFiles = Array.isArray(req.files.snp_files) 
            ? req.files.snp_files 
            : [req.files.snp_files];

        const phenoData = parse(phenoFile.data.toString(), {
            columns: true,
            delimiter: '\t',
            skip_empty_lines: true
        });

        const processedData = [];
        for (const snpFile of snpFiles) {
            const alleleData = parse(snpFile.data.toString(), {
                columns: true,
                delimiter: ',',
                skip_empty_lines: true
            });

            const mergedData = phenoData.map(pheno => {
                const allele = alleleData.find(a => a.strain === pheno.Accession_ID);
                return {
                    ...pheno,
                    alt: allele ? allele.alt : null
                };
            });

            const altValues = mergedData.map(row => row.alt).filter(Boolean);
            const mostCommonAllele = mode(altValues);

            const processedMergedData = mergedData.map(row => ({
                ...row,
                allele: row.alt === mostCommonAllele ? 'minor' : 'major'
            }));

            processedData.push({
                fileName: snpFile.name,
                majorData: processedMergedData.filter(d => d.allele === 'major'),
                minorData: processedMergedData.filter(d => d.allele === 'minor')
            });
        }

        res.json({
            success: true,
            data: processedData
        });

    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).send('An error occurred during file processing');
    }
});

function mode(arr) {
    return arr.sort((a,b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});