const fs = require("fs")
const path = require("path")

function generateSlug(title) {
  if (!title || typeof title !== "string") {
    return "untitled"
  }
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim()
}

function generateCSVRow(property, index) {
  const id = index + 1
  const authorId = 1 // Default author ID
  const contentId = 1 // Default content ID (properties content type)
  const title = property.information?.property_name || `Property ${id}`
  const slug = generateSlug(title)
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ")
  const data = JSON.stringify(property)
  const order = index + 1
  const locale = "en"
  const draftableId = "NULL"
  const status = property.information?.status === "active" ? 1 : 0
  const translationId = "NULL"

  return [
    id,
    authorId,
    contentId,
    title,
    slug,
    currentDate, // published_at
    data,
    order,
    currentDate, // created_at
    currentDate, // updated_at
    locale,
    draftableId,
    status,
    translationId
  ]
}

function escapeCSVField(field) {
  if (field === null || field === undefined || field === "NULL") {
    return "NULL"
  }

  if (typeof field !== "string") {
    field = String(field)
  }

  // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (field.includes(",") || field.includes("\n") || field.includes('"')) {
    return '"' + field.replace(/"/g, '""') + '"'
  }

  return field
}

function convertPropertiesToCSV() {
  try {
    // Read the properties JSON file
    const propertiesPath = path.join(__dirname, "../data/properties.json")
    const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, "utf8"))

    // Ensure data directory exists
    const dataDir = path.join(__dirname, "../data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Complete headers matching the required structure
    const headers = [
      "id",
      "author_id", 
      "content_id",
      "title",
      "slug",
      "published_at",
      "data",
      "order",
      "created_at",
      "updated_at",
      "locale",
      "draftable_id",
      "status",
      "translation_id"
    ]
    
    const csvRows = [headers]

    // Convert each property to CSV row
    propertiesData.forEach((property, index) => {
      const row = generateCSVRow(property, index)
      csvRows.push(row)
    })

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.map((field) => escapeCSVField(field)).join(",")).join("\n")

    // Write to CSV file
    const csvPath = path.join(__dirname, "../data/content_entries.csv")
    fs.writeFileSync(csvPath, csvContent, "utf8")

    console.log(`✅ Successfully converted ${propertiesData.length} properties to content_entries.csv`)
    console.log(`📁 Output file: ${csvPath}`)
    
    // Show sample of generated data
    console.log("\n📋 Sample entries:")
    propertiesData.slice(0, 3).forEach((property, index) => {
      const title = property.information?.property_name || `Property ${index + 1}`
      const slug = generateSlug(title)
      const status = property.information?.status === "active" ? "Active" : "Inactive"
      console.log(`  ${index + 1}. "${title}" -> "${slug}" [${status}]`)
    })
  } catch (error) {
    console.error("❌ Error converting properties:", error.message)
    process.exit(1)
  }
}

// Run the conversion
convertPropertiesToCSV()