import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.utils.validation import validate_email

def test_email_validation():
    print("Testing email validation...")
    
    # Test cases
    test_cases = [
        # Valid emails
        ("user@example.com", True),
        ("user.name@example.com", True),
        ("user+tag@example.com", True),
        ("user@subdomain.example.com", True),
        
        # Invalid emails
        ("", False),
        ("user", False),
        ("user@", False),
        ("@example.com", False),
        ("user@.com", False),
        ("user@example", False),
        ("user@example.", False),
        ("user@exam ple.com", False),
        
        # Edge cases
        ("user@localhost", True),  # Local domains are valid
        ("user@127.0.0.1", True),  # IP addresses are valid
        ("very.long.email.address.with.many.parts@example.com", True),
        ("user@very-long-domain-name-that-is-valid-but-unusual.com", True)
    ]
    
    # Run tests
    failures = 0
    for email, expected_valid in test_cases:
        is_valid, result = validate_email(email)
        
        if is_valid != expected_valid:
            print(f"FAIL: {email}")
            print(f"  Expected: {expected_valid}, Got: {is_valid}")
            print(f"  Result: {result}")
            failures += 1
        else:
            print(f"PASS: {email} -> {'Valid' if is_valid else 'Invalid'}")
            if not is_valid:
                print(f"  Error message: {result}")
    
    print(f"\nTest summary: {len(test_cases) - failures}/{len(test_cases)} tests passed")
    return failures == 0

if __name__ == "__main__":
    success = test_email_validation()
    sys.exit(0 if success else 1)