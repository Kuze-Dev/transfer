const fs = require("fs")
const path = require("path")

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
    return ""
  }

  const str = String(field)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function convertToCustomCSV() {
  try {
    const inputPath = path.join(__dirname, "../data/properties.json")
    const outputPath = path.join(__dirname, "../data/content_entries.csv")

    if (!fs.existsSync(inputPath)) {
      console.error("❌ properties.json not found!")
      return
    }

    const jsonData = JSON.parse(fs.readFileSync(inputPath, "utf8"))
    const headers = [
      "content",
      "title",
      "route_url",
      "published_at",
      "data",
      "status",
      "locale",
      "sites",
      "taxonomy_terms"
    ]

    const rows = [headers.join(",")]
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })

    jsonData.forEach((item, index) => {
      const title = item.information?.property_code || `Property ${index + 1}`
      const slug = generateSlug(title)
      const routeUrl = `/property/${slug}`
      const status = item.information?.status === "Active" ? 1 : 0

      const row = [
        "properties", // content type
        escapeCSVField(title),
        "", // escapeCSVField(routeUrl),
        "",// escapeCSVField(currentDate),
        escapeCSVField(JSON.stringify(item)),
        status,
        "en",
        "", // sites
        ""  // taxonomy_terms
      ]

      rows.push(row.join(","))
    })

    fs.writeFileSync(outputPath, rows.join("\n"))
    console.log("✅ CSV generated successfully!")
    console.log("📁 Output file:", outputPath)

  } catch (err) {
    console.error("❌ Error generating CSV:", err.message)
  }
}

// Run the converter
convertToCustomCSV()
