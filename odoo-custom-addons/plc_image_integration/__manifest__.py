{
    'name': 'PLC Image Integration with Full Metadata',
    'version': '1.2',
    'summary': 'Display PLC-captured images with part, camera, and capture metadata from MinIO',
    'description': """
        Integrates with external Node.js backend to display:
        - Images from MinIO
        - Part information (name, number)
        - Camera details (model, location)
        - Capture metadata (resolution, mode, notes)
        - Timestamps and file info
    """,
    'category': 'Inventory',
    'depends': ['product', 'web'],
    'data': [
        'views/product_view.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
}