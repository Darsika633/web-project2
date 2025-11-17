# Product Suitable Skin Tone Feature Documentation 🎨

## Overview

This feature allows admins to specify which skin tones a product (especially clothing/fashion items) is suitable for. Customers can then filter products by skin tone to find items that match their preferences.

## Feature Details

### Key Characteristics

- **Field Name**: `suitableSkinTone`
- **Data Type**: Array of objects (multiple skin tones per product)
- **Required**: No (optional field)
- **Applies To**: All product categories
- **Filter Type**: Inclusion filter (shows products containing the selected skin tone)

### Skin Tone Structure

Each skin tone entry contains:

```json
{
  "name": "Fair",
  "hex": "#FFE0BD"
}
```

- **name**: Human-readable skin tone name (e.g., "Fair", "Medium", "Deep")
- **hex**: Hexadecimal color code representing the skin tone (optional, must be valid hex format: `#RGB` or `#RRGGBB`)

## Database Schema

### Product Model Addition

```javascript
suitableSkinTone: [
  {
    name: {
      type: String,
      trim: true,
    },
    hex: {
      type: String,
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color code"],
    },
  },
];
```

**Location in Schema**: After `tags` field, before `variants` field

## API Usage

### 1. Creating a Product with Suitable Skin Tones

**Endpoint**: `POST /api/products`

**Authentication**: Admin role required

**Request Body Example**:

```json
{
  "name": "Summer Floral Dress",
  "description": "Beautiful summer dress with floral patterns",
  "brand": "TrendBite",
  "category": "dresses",
  "gender": "women",
  "suitableSkinTone": [
    {
      "name": "Fair",
      "hex": "#FFE0BD"
    },
    {
      "name": "Medium",
      "hex": "#C68642"
    },
    {
      "name": "Tan",
      "hex": "#8D5524"
    }
  ],
  "variants": [
    {
      "size": "M",
      "color": {
        "name": "Blue",
        "hex": "#0000FF"
      },
      "sku": "DRESS-M-BLUE-001",
      "stockQuantity": 50,
      "price": {
        "regular": 59.99,
        "sale": 49.99
      }
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Summer Floral Dress",
    "suitableSkinTone": [
      {
        "name": "Fair",
        "hex": "#FFE0BD"
      },
      {
        "name": "Medium",
        "hex": "#C68642"
      },
      {
        "name": "Tan",
        "hex": "#8D5524"
      }
    ]
    // ... other product fields
  }
}
```

### 2. Updating Product Skin Tones

**Endpoint**: `PUT /api/products/:productId`

**Authentication**: Admin role required

**Request Body Example**:

```json
{
  "suitableSkinTone": [
    {
      "name": "Light",
      "hex": "#F1C27D"
    },
    {
      "name": "Deep",
      "hex": "#4A312C"
    }
  ]
}
```

### 3. Filtering Products by Skin Tone

**Endpoint**: `GET /api/products?skinTone={skinToneName}`

**Authentication**: None required (public endpoint)

**Query Parameters**:

- `skinTone` (optional): Filter by skin tone name (e.g., `Fair`, `Medium`, `Dark`)

**Example Requests**:

```bash
# Filter products suitable for "Fair" skin tone
GET /api/products?skinTone=Fair

# Filter with multiple criteria
GET /api/products?skinTone=Medium&category=dresses&gender=women&page=1&limit=12

# Filter by skin tone in a specific category
GET /api/categories/{categoryId}/products?skinTone=Tan
```

**Response Example**:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Summer Floral Dress",
        "suitableSkinTone": [
          {
            "name": "Fair",
            "hex": "#FFE0BD"
          },
          {
            "name": "Medium",
            "hex": "#C68642"
          }
        ]
        // ... other product fields
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Filter Logic

### How Filtering Works

1. **Single Skin Tone Filter**: When a customer filters by one skin tone (e.g., `skinTone=Fair`):

   - Returns all products where `suitableSkinTone` array **includes** an entry with `name` matching "Fair"
   - Products can have multiple skin tones, so a product suitable for "Fair" and "Medium" will appear in both filters

2. **Case Sensitivity**: Filter is case-insensitive (MongoDB `$in` operator with exact match)

3. **Empty Results**: If no products match the skin tone, returns empty array

4. **No Filter**: If `skinTone` parameter is not provided, all products are returned (no filtering applied)

### Database Query

```javascript
// Internal query logic
if (skinTone) {
  query["suitableSkinTone.name"] = {
    $in: Array.isArray(skinTone) ? skinTone : [skinTone],
  };
}
```

## Frontend Implementation Guide

### Displaying Skin Tone Selector

```jsx
// Example React component
const SkinToneFilter = ({ onFilterChange }) => {
  const skinTones = [
    { name: "Fair", hex: "#FFE0BD" },
    { name: "Light", hex: "#F1C27D" },
    { name: "Medium", hex: "#C68642" },
    { name: "Tan", hex: "#8D5524" },
    { name: "Dark", hex: "#613D30" },
    { name: "Deep", hex: "#4A312C" },
  ];

  return (
    <div className="skin-tone-filter">
      <h3>Suitable Skin Tone</h3>
      <div className="skin-tone-options">
        {skinTones.map((tone) => (
          <button
            key={tone.name}
            onClick={() => onFilterChange("skinTone", tone.name)}
            className="skin-tone-button"
            style={{ backgroundColor: tone.hex }}
          >
            {tone.name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Product Display

```jsx
// Show suitable skin tones on product card
const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      {product.suitableSkinTone && product.suitableSkinTone.length > 0 && (
        <div className="skin-tone-tags">
          <span>Suitable for:</span>
          {product.suitableSkinTone.map((tone, index) => (
            <span
              key={index}
              className="skin-tone-tag"
              style={{
                borderColor: tone.hex,
                color: tone.hex,
              }}
            >
              {tone.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Admin Panel Integration

### Adding Skin Tones to Product Form

```jsx
const ProductForm = ({ product, onSubmit }) => {
  const [suitableSkinTone, setSuitableSkinTone] = useState(
    product?.suitableSkinTone || []
  );

  const addSkinTone = () => {
    setSuitableSkinTone([...suitableSkinTone, { name: "", hex: "" }]);
  };

  const removeSkinTone = (index) => {
    setSuitableSkinTone(suitableSkinTone.filter((_, i) => i !== index));
  };

  const updateSkinTone = (index, field, value) => {
    const updated = [...suitableSkinTone];
    updated[index][field] = value;
    setSuitableSkinTone(updated);
  };

  return (
    <form>
      {/* Other product fields */}

      <div className="skin-tone-section">
        <h3>Suitable Skin Tones (Optional)</h3>
        {suitableSkinTone.map((tone, index) => (
          <div key={index} className="skin-tone-input">
            <input
              type="text"
              placeholder="Skin tone name (e.g., Fair)"
              value={tone.name}
              onChange={(e) => updateSkinTone(index, "name", e.target.value)}
            />
            <input
              type="color"
              value={tone.hex || "#FFFFFF"}
              onChange={(e) => updateSkinTone(index, "hex", e.target.value)}
            />
            <button type="button" onClick={() => removeSkinTone(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addSkinTone}>
          Add Skin Tone
        </button>
      </div>

      {/* Submit button */}
    </form>
  );
};
```

## Common Skin Tone Categories

Here are suggested skin tone categories with hex codes:

| Name   | Hex Code | Description           |
| ------ | -------- | --------------------- |
| Fair   | #FFE0BD  | Very light complexion |
| Light  | #F1C27D  | Light complexion      |
| Medium | #C68642  | Medium complexion     |
| Tan    | #8D5524  | Tan complexion        |
| Dark   | #613D30  | Dark complexion       |
| Deep   | #4A312C  | Very dark complexion  |

**Note**: Admins can use any custom names and colors that make sense for their products.

## Validation Rules

### Server-Side Validation

1. **Hex Code Format**:

   - Must start with `#`
   - Must be followed by exactly 3 or 6 hexadecimal characters
   - Examples: `#FFF`, `#FFFFFF`, `#C68642`
   - Invalid: `FFF`, `#GGGGGG`, `#12345`

2. **Name Field**:

   - No strict validation (admin can use any name)
   - Automatically trimmed of whitespace

3. **Optional Field**:
   - Empty array is valid
   - Field can be omitted entirely

### Client-Side Validation

```javascript
const validateSkinTone = (skinTone) => {
  const errors = [];

  skinTone.forEach((tone, index) => {
    if (!tone.name || tone.name.trim() === "") {
      errors.push(`Skin tone #${index + 1}: Name is required`);
    }

    if (tone.hex && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(tone.hex)) {
      errors.push(`Skin tone #${index + 1}: Invalid hex color code`);
    }
  });

  return errors;
};
```

## Use Cases

### 1. Fashion E-commerce

- Clothing items (dresses, shirts, pants) that look better on certain skin tones
- Helps customers find clothes that complement their complexion

### 2. Makeup & Cosmetics

- Foundation shades suitable for different skin tones
- Lipstick colors that work well with specific complexions

### 3. Jewelry & Accessories

- Metal colors (gold, silver, rose gold) that complement different skin tones
- Gemstone colors that look best on certain complexions

### 4. Home Decor

- Paint colors recommended for rooms
- Fabric colors for furniture

## Best Practices

### For Admins

1. **Be Inclusive**: Provide a wide range of skin tone options
2. **Be Honest**: Only mark skin tones that genuinely work well with the product
3. **Use Multiple Tones**: Most products work with multiple skin tones
4. **Provide Context**: Use the product description to explain why certain tones work well
5. **Regular Updates**: Update skin tone recommendations based on customer feedback

### For Developers

1. **Make it Optional**: Don't require this field for all products
2. **Provide Defaults**: Offer common skin tone presets in the admin panel
3. **Visual Feedback**: Show color swatches alongside names
4. **Clear Labeling**: Make it clear this is about suitability, not exclusion
5. **Accessibility**: Ensure color pickers work with keyboard navigation

## Testing

### Test Scenarios

1. **Create Product Without Skin Tones**

   ```bash
   POST /api/products
   # Body: (no suitableSkinTone field)
   # Expected: Product created successfully
   ```

2. **Create Product With Multiple Skin Tones**

   ```bash
   POST /api/products
   # Body: suitableSkinTone: [{ name: "Fair", hex: "#FFE0BD" }, { name: "Medium", hex: "#C68642" }]
   # Expected: Product created with both skin tones
   ```

3. **Filter by Skin Tone**

   ```bash
   GET /api/products?skinTone=Fair
   # Expected: Only products with "Fair" in suitableSkinTone array
   ```

4. **Invalid Hex Code**

   ```bash
   POST /api/products
   # Body: suitableSkinTone: [{ name: "Fair", hex: "INVALID" }]
   # Expected: Validation error
   ```

5. **Update Skin Tones**
   ```bash
   PUT /api/products/:id
   # Body: suitableSkinTone: [{ name: "Dark", hex: "#613D30" }]
   # Expected: Product updated with new skin tones
   ```

## Performance Considerations

### Indexing

Consider adding an index for better filter performance:

```javascript
// In Product model
productSchema.index({ "suitableSkinTone.name": 1 });
```

### Query Optimization

- Filter uses MongoDB `$in` operator which is efficient
- Consider caching popular skin tone filters
- For large catalogs, use pagination to limit results

## Migration Guide

If adding this feature to an existing system:

1. **Database Migration**: No migration needed - field is optional
2. **Existing Products**: Will have empty `suitableSkinTone` array
3. **Backward Compatibility**: API continues to work for clients not using this feature
4. **Admin Training**: Train admins on how to use the feature
5. **Frontend Updates**: Roll out filter UI gradually

## Troubleshooting

### Common Issues

**Issue**: Skin tone filter returns no results

- **Solution**: Check that products have `suitableSkinTone` field populated
- **Solution**: Verify exact spelling of skin tone name (case-sensitive)

**Issue**: Hex validation fails

- **Solution**: Ensure hex code starts with `#` and has 3 or 6 hex digits
- **Solution**: Use color picker instead of manual entry

**Issue**: Products show in wrong skin tone filter

- **Solution**: Verify `suitableSkinTone` array contents in database
- **Solution**: Update product to correct skin tone values

## Future Enhancements

Potential improvements:

- [ ] AI-powered skin tone matching from product images
- [ ] Customer skin tone preferences in profile
- [ ] Personalized product recommendations based on skin tone
- [ ] Visual skin tone comparison tool
- [ ] Analytics on popular skin tone filters
- [ ] Multi-language skin tone names
- [ ] Skin tone matching quiz for customers

## Support

For questions or issues:

- Check this documentation first
- Review API examples in Swagger UI
- Contact development team at dev@trendbite.com

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Author**: TrendBite Development Team
