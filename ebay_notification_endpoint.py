"""
eBay Notification Endpoint - Standalone Flask App
Minimal Flask application for handling eBay marketplace deletion notifications

Deployment:
1. pip install flask gunicorn
2. export EBAY_VERIFICATION_TOKEN="TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx"
3. gunicorn -w 4 -b 0.0.0.0:5000 ebay_notification_endpoint:app

Endpoint URL: https://tnrbusinesssolutions.com/ebay/notifications/marketplace-deletion
"""

from flask import Flask, request, jsonify
import os
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Get verification token from environment or use default
EBAY_VERIFICATION_TOKEN = os.getenv(
    'EBAY_VERIFICATION_TOKEN',
    'TNR-Cards-2026-woowreDVxpwAmvzZ2LE2DOOx'
)


@app.route('/ebay/notifications/marketplace-deletion', methods=['GET', 'POST'])
def ebay_notification():
    """
    Handle eBay notification webhook
    
    GET: Webhook verification (challenge-response)
    POST: Receive notification events
    """
    
    if request.method == 'GET':
        return handle_verification()
    elif request.method == 'POST':
        return handle_notification()


def handle_verification():
    """
    Handle eBay webhook verification (GET request)
    eBay sends a challenge string that must be echoed back
    """
    challenge = request.args.get('challenge')
    verify_token = request.args.get('verificationToken') or request.headers.get('X-eBay-Verification-Token')
    
    logger.info("eBay Webhook Verification Request:", extra={
        'challenge': challenge,
        'verify_token': verify_token[:10] + '...' if verify_token else None,
        'query_params': dict(request.args),
        'headers': dict(request.headers)
    })
    
    # Verify the token matches
    if verify_token != EBAY_VERIFICATION_TOKEN:
        logger.warning("eBay verification token mismatch", extra={
            'received': verify_token[:10] + '...' if verify_token else None,
            'expected': EBAY_VERIFICATION_TOKEN[:10] + '...'
        })
        return jsonify({
            'success': False,
            'error': 'Invalid verification token'
        }), 401
    
    # Return the challenge string (eBay requirement)
    if challenge:
        logger.info("✅ eBay webhook verified successfully")
        return challenge, 200, {'Content-Type': 'text/plain'}
    
    # If no challenge, return success anyway
    return jsonify({
        'success': True,
        'message': 'eBay webhook endpoint is active',
        'verification_token': EBAY_VERIFICATION_TOKEN[:10] + '...'
    }), 200


def handle_notification():
    """
    Handle eBay notification events (POST request)
    """
    try:
        notification = request.get_json()
        
        logger.info("📦 eBay Notification Received:", extra={
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': notification.get('eventType') or notification.get('notificationType') or notification.get('topic'),
            'topic': notification.get('topic'),
            'data': notification.get('data') or notification.get('payload')
        })
        
        # Handle different notification types
        event_type = (
            notification.get('eventType') or 
            notification.get('notificationType') or 
            notification.get('topic')
        )
        
        if event_type in ['MARKETPLACE_ACCOUNT_DELETION', 'marketplace-deletion', 'MARKETPLACE_DELETION']:
            handle_marketplace_deletion(notification)
        elif event_type in ['ORDER_CREATED', 'order-created']:
            handle_order_created(notification)
        elif event_type in ['ORDER_UPDATED', 'order-updated']:
            handle_order_updated(notification)
        elif event_type in ['INVENTORY_UPDATED', 'inventory-updated']:
            handle_inventory_updated(notification)
        else:
            logger.warning("⚠️ Unknown eBay notification type", extra={'event_type': event_type})
        
        # Always return 200 OK to acknowledge receipt (eBay requirement)
        return jsonify({
            'success': True,
            'message': 'Notification received and processed',
            'event_type': event_type,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except json.JSONDecodeError as e:
        logger.error("❌ Error parsing eBay notification", extra={
            'error': str(e),
            'raw_body': request.data[:500].decode('utf-8', errors='ignore')
        })
        # Still return 200 to prevent eBay from retrying invalid payloads
        return jsonify({
            'success': False,
            'error': 'Notification received but could not be parsed',
            'message': str(e)
        }), 200
    except Exception as e:
        logger.error("❌ eBay notification handler error", extra={'error': str(e)})
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 200  # Return 200 to prevent retries


def handle_marketplace_deletion(notification):
    """
    Handle marketplace account deletion notification
    """
    data = notification.get('data') or notification.get('payload') or {}
    
    logger.info("🗑️ Marketplace Deletion Notification:", extra={
        'user_id': data.get('userId'),
        'marketplace_id': data.get('marketplaceId'),
        'timestamp': notification.get('timestamp') or datetime.utcnow().isoformat()
    })
    
    # TODO: Implement your business logic here
    # Examples:
    # - Remove user data from your database
    # - Cancel active subscriptions
    # - Send notification email
    # - Update CRM records
    
    # Example: Log to file or database
    # with open('ebay_deletions.log', 'a') as f:
    #     f.write(json.dumps(notification) + '\n')


def handle_order_created(notification):
    """
    Handle order created notification
    """
    data = notification.get('data') or notification.get('payload') or {}
    
    logger.info("🛒 Order Created Notification:", extra={
        'order_id': data.get('orderId'),
        'buyer_id': data.get('buyerId'),
        'total': data.get('total')
    })
    
    # TODO: Implement order processing logic
    # - Create order in your system
    # - Update inventory
    # - Send confirmation email
    # - Update CRM


def handle_order_updated(notification):
    """
    Handle order updated notification
    """
    data = notification.get('data') or notification.get('payload') or {}
    
    logger.info("📝 Order Updated Notification:", extra={
        'order_id': data.get('orderId'),
        'status': data.get('status')
    })
    
    # TODO: Implement order update logic
    # - Update order status in your system
    # - Trigger fulfillment if needed
    # - Send status update email


def handle_inventory_updated(notification):
    """
    Handle inventory updated notification
    """
    data = notification.get('data') or notification.get('payload') or {}
    
    logger.info("📦 Inventory Updated Notification:", extra={
        'sku': data.get('sku'),
        'quantity': data.get('quantity')
    })
    
    # TODO: Implement inventory sync logic
    # - Update inventory levels
    # - Sync with your inventory system
    # - Update product listings if needed


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'eBay Notification Endpoint',
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'service': 'eBay Notification Endpoint',
        'version': '1.0.0',
        'endpoint': '/ebay/notifications/marketplace-deletion',
        'status': 'active'
    }), 200


if __name__ == '__main__':
    # Development server
    app.run(host='0.0.0.0', port=5000, debug=True)
else:
    # Production (Gunicorn)
    logger.info("Starting eBay notification endpoint", extra={
        'verification_token': EBAY_VERIFICATION_TOKEN[:10] + '...'
    })
