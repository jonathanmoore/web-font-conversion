#!/bin/bash

# Define input and output directories
INPUT_DIR="input"
OUTPUT_DIR="output"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if the input directory exists
if [ ! -d "$INPUT_DIR" ]; then
  echo "Error: Input directory '$INPUT_DIR' not found."
  exit 1
fi

# Loop through all .otf files in the input directory
for otf_file in "$INPUT_DIR"/*.otf; do
  # Check if the file exists (handles cases where no .otf files are found)
  [ -e "$otf_file" ] || continue

  # Get the base filename without the extension
  base_name=$(basename "$otf_file" .otf)

  # Define output file paths
  woff_file="$OUTPUT_DIR/$base_name.woff"
  woff2_file="$OUTPUT_DIR/$base_name.woff2"

  echo "Converting '$otf_file' to WOFF and WOFF2..."

  # Convert to WOFF using fonttools subset
  fonttools subset "$otf_file" --flavor=woff --output-file="$woff_file"
  if [ $? -ne 0 ]; then
    echo "Error converting '$otf_file' to WOFF."
  else
    echo "  -> Created '$woff_file'"
  fi


  # Convert to WOFF2 using fonttools
  fonttools ttLib.woff2 compress "$otf_file" -o "$woff2_file"
   if [ $? -ne 0 ]; then
    echo "Error converting '$otf_file' to WOFF2."
  else
    echo "  -> Created '$woff2_file'"
  fi

done

echo "Font conversion complete."

exit 0 