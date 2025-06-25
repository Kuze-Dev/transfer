const fs = require("fs")

function generateSlug(text) {
  if (!text || typeof text !== "string") {
    return "untitled"
  }

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace multiple spaces with single hyphen
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "") // Remove leading and trailing hyphens
    .trim()
}

function escapeCSVField(field) {
  if (field === null || field === undefined) {
    return "NULL"
  }

  const str = String(field)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function convertJsonToCsvAdvanced() {
  try {
    if (!fs.existsSync("../data/properties.json")) {
      console.error("❌ properties.json file not found!")
      process.exit(1)
    }

    const jsonData = JSON.parse(fs.readFileSync("../data/properties.json", "utf8"))

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
      "translation_id",
    ]

    const csvRows = [headers.join(",")]
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ")

    jsonData.forEach((property, index) => {
      const propertyName = property.information?.property_name || `Property ${index + 1}`
      const contentId = `PR-${String(index + 1).padStart(4, "0")}`
      const slug = generateSlug(propertyName)

      console.log(`Processing: "${propertyName}" -> slug: "${slug}"`) // Debug log

      const row = [
        index + 1, // id
        1, // author_id
        escapeCSVField(contentId), // content_id
        escapeCSVField(propertyName), // title
        escapeCSVField(slug), // slug
        currentDate, // published_at
        escapeCSVField(JSON.stringify(property)), // data
        index + 1, // order
        currentDate, // created_at
        currentDate, // updated_at
        "en", // locale
        "NULL", // draftable_id
        property.information?.status === "active" ? 1 : 0, // status
        "NULL", // translation_id
      ]

      csvRows.push(row.join(","))
    })

    fs.writeFileSync("content-entries.csv", csvRows.join("\n"))
    console.log("✅ Advanced conversion completed!")
    console.log(`📊 Processed ${jsonData.length} properties`)
    console.log("📁 Output: content-entries.csv")

    // Show sample of generated slugs
    console.log("\n🔗 Sample slugs generated:")
    jsonData.slice(0, 5).forEach((property, index) => {
      const title = property.information?.property_name || `Property ${index + 1}`
      const slug = generateSlug(title)
      console.log(`  "${title}" -> "${slug}"`)
    })
  } catch (error) {
    console.error("❌ Error:", error.message)
    console.error("Stack trace:", error.stack)
  }
}

// Run the advanced conversion
convertJsonToCsvAdvanced()