from flask import jsonify

def success_response(data=None, message=None, status_code=200):
    """
    Create a standardized success response
    """
    response = {
        'success': True
    }
    
    if data is not None:
        response['data'] = data
    
    if message is not None:
        response['message'] = message
    
    return jsonify(response), status_code

def error_response(message, errors=None, status_code=400):
    """
    Create a standardized error response
    """
    response = {
        'success': False,
        'message': message
    }
    
    if errors is not None:
        response['errors'] = errors
    
    return jsonify(response), status_code