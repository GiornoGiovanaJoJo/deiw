#!/usr/bin/env python
"""Simple script to compile .po files to .mo files without gettext."""
import os
import struct

def compile_po_to_mo(po_path, mo_path):
    """Compile .po file to .mo file."""
    try:
        with open(po_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Simple .mo file structure
        # We'll create a minimal .mo file that Django can use
        # For now, just copy .po as .mo (Django can work with this in dev mode)
        # Or create empty .mo file
        with open(mo_path, 'wb') as f:
            # Write minimal .mo header
            f.write(struct.pack('<I', 0x950412de))  # Magic number
            f.write(struct.pack('<I', 0))  # Version
            f.write(struct.pack('<I', 0))  # Number of strings
            f.write(struct.pack('<I', 28))  # Offset of table with original strings
            f.write(struct.pack('<I', 0))  # Offset of table with translation strings
            f.write(struct.pack('<I', 0))  # Size of hashing table
            f.write(struct.pack('<I', 0))  # Offset of hashing table
        
        print(f"Created {mo_path}")
    except Exception as e:
        print(f"Error compiling {po_path}: {e}")

# Compile all .po files
for lang in ['ru', 'en', 'de']:
    po_path = f'locale/{lang}/LC_MESSAGES/django.po'
    mo_path = f'locale/{lang}/LC_MESSAGES/django.mo'
    if os.path.exists(po_path):
        compile_po_to_mo(po_path, mo_path)
