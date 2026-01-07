# Evidence Comparison Tool - Feature Documentation

## 📋 Overview

The Evidence Comparison Tool is a forensic-grade feature that allows investigators, analysts, and legal professionals to compare 2-4 evidence items side-by-side with blockchain verification and comprehensive metadata analysis.

## ✨ Features

### Core Functionality
- **Multi-Evidence Selection**: Compare 2-4 evidence items simultaneously
- **Flexible Layouts**: Choose from 2-column, 3-column, 4-column grid, or split view
- **Metadata Comparison**: Detailed comparison table showing all evidence properties
- **Blockchain Verification**: Real-time blockchain hash verification for each evidence item
- **Synchronized Scrolling**: Optional synchronized scrolling across all panels
- **PDF Export**: Generate professional comparison reports with blockchain proof
- **Search & Filter**: Quick search across evidence title, case ID, hash, and type

### Supported File Types
- 📸 **Images**: JPG, PNG, JPEG, GIF
- 🎥 **Videos**: MP4, AVI, MOV, WebM
- 📄 **Documents**: PDF, TXT
- 📦 **Other**: All file types with metadata comparison

## 🎯 Use Cases

### 1. Detect Evidence Tampering
Compare original vs modified evidence to identify alterations:
- Visual differences in images
- Metadata discrepancies
- Hash mismatches
- Timestamp inconsistencies

### 2. Analyze Related Evidence
View multiple pieces of evidence from the same incident:
- Multiple camera angles
- Sequential photos
- Related documents
- Witness statements

### 3. Verify Consistency
Ensure consistency across different sources:
- Cross-reference evidence
- Validate chain of custody
- Verify blockchain integrity
- Compare submission details

### 4. Court Presentations
Create professional comparison reports:
- Side-by-side visual comparison
- Metadata verification table
- Blockchain proof inclusion
- PDF export for court submission

## 🚀 How to Use

### Step 1: Access the Tool
1. Login to your dashboard
2. Navigate to **Quick Actions**
3. Click **"Compare Evidence"**

### Step 2: Select Evidence
1. Browse available evidence items
2. Use the search box to filter evidence
3. Click on evidence cards to select (max 4)
4. Selected items appear as chips below
5. Click the "X" on chips to deselect

### Step 3: Choose Layout
1. Select your preferred layout from the dropdown:
   - **2 Column Grid**: Best for comparing 2 items
   - **3 Column Grid**: Compare 3 items
   - **4 Column Grid**: Compare up to 4 items
   - **Split View**: Traditional side-by-side comparison

### Step 4: Compare Evidence
1. Click **"Compare Selected Evidence"**
2. View the metadata comparison table
3. Examine evidence in side-by-side panels
4. Use synchronized scrolling for documents
5. Toggle metadata visibility as needed

### Step 5: Export Report
1. Click **"Export Report"** button
2. PDF report is generated automatically
3. Includes:
   - All metadata comparison
   - Blockchain verification proof
   - Timestamp and hash information
   - Chain of custody details

## 🔧 Technical Implementation

### Frontend Components

#### HTML Structure (`evidence-comparison.html`)
- Evidence selector with search
- Layout mode selector
- Selected evidence chips
- Comparison view with panels
- Metadata comparison table
- Export functionality

#### CSS Styling (`evidence-comparison.css`)
- Modern gradient design
- Responsive grid layouts
- Smooth animations
- Premium aesthetics
- Print-friendly styles

#### JavaScript Logic (`evidence-comparison.js`)
- Evidence selection management
- Dynamic panel rendering
- Synchronized scrolling
- PDF generation
- Blockchain verification display

### Backend API Endpoints

#### 1. GET `/api/evidence/compare?ids=123,456`
Fetch multiple evidence items for comparison.

**Query Parameters:**
- `ids`: Comma-separated evidence IDs (2-4 items)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "evidence": [
    {
      "id": 123,
      "title": "Evidence 1",
      "hash": "0x...",
      "blockchain_verified": true,
      ...
    }
  ]
}
```

#### 2. POST `/api/evidence/comparison-report`
Generate and store comparison report.

**Request Body:**
```json
{
  "evidenceIds": [123, 456],
  "reportData": {...},
  "generatedBy": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comparison report generated successfully",
  "report": {...}
}
```

#### 3. GET `/api/evidence/:id/blockchain-proof`
Get blockchain verification proof for specific evidence.

**Response:**
```json
{
  "success": true,
  "proof": {
    "evidence_id": 123,
    "hash": "0x...",
    "verification_status": "verified",
    "blockchain_network": "Ethereum",
    "chain_of_custody": {...}
  }
}
```

## 📊 Metadata Comparison Table

The metadata table compares the following properties:

| Property | Description | Verification |
|----------|-------------|--------------|
| File Name | Original filename | - |
| File Type | MIME type | - |
| File Size | Size in bytes | - |
| Case ID | Associated case | Consistency check |
| Submitted By | Wallet address | - |
| Timestamp | Upload time | Chronological check |
| Blockchain Hash | SHA-256 hash | ✅ Verified |
| Status | Evidence status | - |

**Color Coding:**
- 🟢 **Green (Verified)**: All values match across evidence
- 🔴 **Red (Mismatch)**: Values differ (potential tampering)
- ⚫ **Black (Hash)**: Unique blockchain hashes

## 🎨 User Interface Features

### Modern Design Elements
- **Gradient Backgrounds**: Premium purple gradient theme
- **Smooth Animations**: Slide-down, fade-in, pop-in effects
- **Hover Effects**: Interactive card transformations
- **Responsive Layout**: Mobile, tablet, and desktop support
- **Loading States**: Spinner overlay during operations

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast text
- Clear visual hierarchy

## 🔐 Security Features

### Blockchain Verification
- Real-time hash verification
- Chain of custody tracking
- Tamper detection
- Integrity validation

### Access Control
- Role-based access (Investigator, Analyst, Legal, etc.)
- User authentication required
- Activity logging
- Audit trail

## 📱 Responsive Design

### Desktop (1200px+)
- Full grid layouts (2-4 columns)
- Side-by-side panels
- Expanded metadata table

### Tablet (768px - 1199px)
- 2-column maximum
- Stacked panels
- Scrollable metadata

### Mobile (<768px)
- Single column layout
- Vertical stacking
- Touch-optimized controls

## 🧪 Testing Guide

### Manual Testing Checklist

#### Evidence Selection
- [ ] Can select 2-4 evidence items
- [ ] Cannot select more than 4 items
- [ ] Can deselect items
- [ ] Search filters evidence correctly
- [ ] Selected count updates accurately

#### Comparison View
- [ ] Metadata table displays correctly
- [ ] All layouts render properly
- [ ] Synchronized scrolling works
- [ ] Evidence content displays (images, videos, PDFs)
- [ ] Blockchain verification shows

#### Export Functionality
- [ ] PDF generates successfully
- [ ] PDF contains all metadata
- [ ] PDF includes blockchain proof
- [ ] Filename includes timestamp

#### Responsive Design
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] All buttons accessible
- [ ] Text readable at all sizes

## 🚨 Troubleshooting

### Common Issues

#### Evidence Not Loading
**Problem**: Evidence list is empty
**Solution**: 
- Check database connection
- Verify evidence exists in database
- Check browser console for errors

#### PDF Export Fails
**Problem**: PDF export button doesn't work
**Solution**:
- Ensure jsPDF library is loaded
- Check browser console for errors
- Verify at least 2 items selected

#### Synchronized Scrolling Not Working
**Problem**: Panels don't scroll together
**Solution**:
- Click "Sync Scrolling" button to toggle
- Ensure panels have scrollable content
- Check browser compatibility

#### Layout Issues
**Problem**: Panels overlap or misalign
**Solution**:
- Try different layout mode
- Refresh the page
- Check screen resolution

## 📈 Future Enhancements

### Planned Features
- [ ] Visual diff highlighting for images (pixelmatch)
- [ ] Text diff for documents (diff-match-patch)
- [ ] Video frame comparison (ffmpeg.wasm)
- [ ] Advanced PDF comparison (pdf-lib)
- [ ] Annotation tools
- [ ] Collaborative comparison sessions
- [ ] Real-time blockchain verification
- [ ] Advanced export options (Word, Excel)
- [ ] Comparison history tracking
- [ ] AI-powered difference detection

### Performance Optimizations
- [ ] Lazy loading for large evidence sets
- [ ] Image optimization
- [ ] Caching mechanism
- [ ] Progressive loading
- [ ] Virtual scrolling for large lists

## 📚 API Integration Examples

### Fetch Evidence for Comparison
```javascript
const response = await fetch('/api/evidence/compare?ids=1,2,3');
const data = await response.json();
console.log(data.evidence);
```

### Generate Comparison Report
```javascript
const response = await fetch('/api/evidence/comparison-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    evidenceIds: [1, 2, 3],
    reportData: { findings: '...' },
    generatedBy: '0x...'
  })
});
```

### Get Blockchain Proof
```javascript
const response = await fetch('/api/evidence/123/blockchain-proof');
const data = await response.json();
console.log(data.proof);
```

## 🤝 Contributing

To contribute to this feature:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/comparison-enhancement`
3. Make changes and test thoroughly
4. Commit: `git commit -m "Add: new comparison feature"`
5. Push: `git push origin feature/comparison-enhancement`
6. Create Pull Request

## 📄 License

This feature is part of the EVID-DGC project and follows the MIT License.

## 👥 Credits

**Developed by**: EVID-DGC Team
**Feature Request**: Issue #42
**Implementation**: Evidence Comparison Tool v1.0
**Last Updated**: January 2026

---

**For support or questions, please open an issue on GitHub or contact the development team.**
