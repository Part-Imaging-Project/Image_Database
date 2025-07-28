from odoo import models, fields, api
import requests
import logging

_logger = logging.getLogger(__name__)

class ProductProduct(models.Model):
    _inherit = 'product.product'

    plc_images = fields.One2many('plc.image', 'product_id', string='PLC Captured Images')

    def action_fetch_images(self):
        """Fetch images from Node.js REST API using part_number"""
        self.ensure_one()
        self.plc_images.unlink()  # Clear old images

        # Use part_number (mapped from default_code) to query API
        part_number = self.default_code
        if not part_number:
            return

        try:
            # Call your Node.js API
            response = requests.get(
                'http://localhost:8000/images',
                params={'part_number': part_number},
                timeout=15
            )
            if response.status_code == 200:
                images_data = response.json()
                for img in images_data:
                    # Match part via part_number
                    if img.get('part_number') == part_number:
                        self.env['plc.image'].create({
                            'product_id': self.id,
                            'image_url': f"http://localhost:9000/{img['bucket_name']}/{img['file_name']}",
                            'file_name': img['file_name'],
                            'file_type': img['file_type'],
                            'image_size': img['image_size'],
                            'captured_at': img['captured_at'],
                            'part_name': img['part_name'],
                            'part_number': img['part_number'],
                            'camera_model': img['device_model'],
                            'camera_location': img['location'],
                            'resolution': img['resolution'],
                            'capture_mode': img['capture_mode'],
                            'notes': img['notes'],
                        })
        except Exception as e:
            _logger.error(f"Error fetching PLC images: {e}")

class PlcImage(models.Model):
    _name = 'plc.image'
    _description = 'PLC Captured Image with Full Metadata'
    _order = 'captured_at desc'

    product_id = fields.Many2one('product.product', 'Product', ondelete='cascade', required=True)
    
    # Image Info
    image_url = fields.Char('Image URL', readonly=True)
    file_name = fields.Char('File Name', readonly=True)
    file_type = fields.Char('MIME Type', readonly=True)
    image_size = fields.Integer('Size (bytes)', readonly=True)
    captured_at = fields.Datetime('Captured At', readonly=True)

    # Part Info
    part_name = fields.Char('Part Name', readonly=True)
    part_number = fields.Char('Part Number', readonly=True)

    # Camera Info
    camera_model = fields.Char('Camera Model', readonly=True)
    camera_location = fields.Char('Camera Location', readonly=True)

    # Capture Metadata
    resolution = fields.Char('Resolution', readonly=True)
    capture_mode = fields.Char('Capture Mode', readonly=True)
    notes = fields.Text('Notes', readonly=True)

    # Optional: Preview in list view
    def _compute_image(self):
        for rec in self:
            rec.image = rec.image_url
    image = fields.Char(compute='_compute_image', string='Preview')