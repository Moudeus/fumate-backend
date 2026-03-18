# MBTI-Major Relationship Refactoring

## Vấn đề ban đầu

Trước đây, mối quan hệ many-to-many giữa MBTI và Major được lưu trữ ở 3 nơi:

1. **MBTIType.majors[]** - Array ObjectId của Major
2. **Major.mbtiCompatibility[]** - Array ObjectId của MBTICompatibility  
3. **MBTICompatibility** - Collection riêng với majorId, mbtiType, và thông tin chi tiết

Điều này gây ra:
- Duplicate data
- Khó maintain consistency
- Phức tạp khi CRUD

## Giải pháp mới

Sử dụng **MBTICompatibility** làm single source of truth cho mối quan hệ many-to-many:

```
MBTICompatibility (Junction Table)
├── majorId: ObjectId → Major
├── mbtiType: String (INTJ, ENFP, etc.)
├── compatibilityScore: Number (0-100)
├── description: String
├── strengths: String[]
├── challenges: String[]
├── careerExamples: String[]
└── isActive: Boolean
```

### Các thay đổi

#### 1. Models

**MBTIType** - Đã xóa field `majors[]`
```typescript
export interface IMBTIType extends Document {
  type: string;
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  // majors: Types.ObjectId[]; // ❌ Đã xóa
  isActive: boolean;
}
```

**Major** - Đã xóa field `mbtiCompatibility[]`
```typescript
export interface IMajor extends Document {
  code: string;
  name: string;
  // ... other fields
  universities: Types.ObjectId[];
  // mbtiCompatibility: Types.ObjectId[]; // ❌ Đã xóa
  isActive: boolean;
}
```

**MBTICompatibility** - Giữ nguyên (đây là source of truth)
```typescript
export interface IMBTICompatibility extends Document {
  majorId: Types.ObjectId; // Reference to Major
  mbtiType: string; // MBTI type code
  compatibilityScore: number;
  description: string;
  strengths: string[];
  challenges: string[];
  careerExamples: string[];
  isActive: boolean;
}
```

#### 2. Query Patterns

**Lấy majors cho 1 MBTI type:**
```typescript
const compatibilities = await MBTICompatibility.find({ 
  mbtiType: 'INTJ',
  isActive: true 
})
.populate('majorId')
.sort({ compatibilityScore: -1 });

const majors = compatibilities.map(c => c.majorId);
```

**Lấy MBTI types cho 1 major:**
```typescript
const compatibilities = await MBTICompatibility.find({ 
  majorId: majorId,
  isActive: true 
})
.sort({ compatibilityScore: -1 });

const mbtiTypes = compatibilities.map(c => c.mbtiType);
```

**CRUD Major (không thay đổi):**
```typescript
// Vẫn CRUD bình thường
await Major.create({ code: 'CNTT', name: 'Công nghệ thông tin', ... });
await Major.findByIdAndUpdate(id, updateData);
await Major.findByIdAndDelete(id);
```

#### 3. Services Updated

**major.service.ts:**
- `createMBTICompatibility()` - Không còn update Major.mbtiCompatibility
- `deleteMBTICompatibility()` - Không còn remove từ Major.mbtiCompatibility

**mbti.engine.ts:**
- `calculateMBTIType()` - Query majors từ MBTICompatibility thay vì populate từ MBTIType

#### 4. Seed Scripts

**seedMBTI.ts:**
- Tạo MBTIType không có majors array
- Tạo MBTICompatibility records riêng cho mỗi MBTI-Major pair

## Migration

### Chạy migration script

```bash
cd Backend
npm run build
node dist/scripts/migrateMBTIRelationship.js
```

Script sẽ:
1. Đọc data cũ từ MBTIType.majors[]
2. Tạo MBTICompatibility records tương ứng
3. Xóa fields cũ (majors, mbtiCompatibility) khỏi database

### Reseed data (alternative)

Nếu muốn bắt đầu từ đầu:

```bash
cd Backend
npm run build
node dist/scripts/seedMBTI.js
```

## Testing

Sau khi migration, test các API endpoints:

```bash
# Get MBTI result with recommended majors
GET /api/mbti/result/:userId

# Get majors by MBTI compatibility
GET /api/majors/by-mbti/:mbtiType

# Get compatibility for specific major and MBTI
GET /api/majors/:majorId/compatibility/:mbtiType
```

## Benefits

✅ Single source of truth cho mối quan hệ MBTI-Major
✅ Dễ maintain và update
✅ Không duplicate data
✅ Vẫn giữ được Major model độc lập để CRUD
✅ Có thể thêm metadata (score, description, strengths) cho mỗi relationship
✅ Query performance tốt hơn với proper indexing

## Breaking Changes

⚠️ API responses có thể thay đổi structure:
- Trước: `mbtiType.majors[]` trả về array of Major objects
- Sau: Cần query qua MBTICompatibility để lấy majors

⚠️ Frontend cần update nếu đang sử dụng:
- `mbtiType.majors`
- `major.mbtiCompatibility`

## Rollback

Nếu cần rollback, restore database backup trước khi migration.
