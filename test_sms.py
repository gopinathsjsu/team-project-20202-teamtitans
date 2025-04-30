#!/usr/bin/env python3

import os
import sys
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

# Main function to test SMS sending
def test_sms():
    print("BookTableBuddy SMS Test (Using Twilio Test Credentials)")
    print("-" * 50)
    
    # These are the Twilio credentials
    account_sid = 'ACe8c69d5e853f09477c951409f0ea866f'
    auth_token = 'dfeac1e5851f68afee715a9dc3667946'
    
    # Use a valid phone number format (+1XXXXXXXXXX)
    to_number = '+16692927868'  # The number you're sending to
    from_number = '+18446434380'  # Your Twilio number
    
    print(f"From: {from_number}")
    print(f"To: {to_number}")
    print()
    
    try:
        # Create the Twilio client
        print("Initializing Twilio client...")
        client = Client(account_sid, auth_token)
        
        # Prepare message text
        message_text = "🍽️ BookTableBuddy: This is a test SMS. Your reservation is confirmed!"
        
        print("Sending SMS message...")
        
        # Send the message
        message = client.messages.create(
            body=message_text,
            from_=from_number,
            to=to_number
        )
        
        print(f"Success! Message SID: {message.sid}")
        print("You should receive the test message on your phone shortly.")
        return True
        
    except TwilioRestException as e:
        print(f"Twilio Error: {e.msg}")
        print(f"Error Code: {e.code}")
        print(f"More Info: {e.more_info}")
        
        if e.code == 20003:
            print("Authentication Error: Check that your Account SID and Auth Token are correct.")
            print("Visit https://www.twilio.com/console to verify your credentials.")
        elif e.code == 21608:
            print("TIP: You need to verify the recipient's phone number in your Twilio account.")
            print("For trial accounts, each recipient number must be verified before sending.")
        elif e.code == 21211:
            print("TIP: The phone number format is invalid. Make sure it includes the country code.")
            print("Example: +14155551234 for a US number")
        return False
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

# Run the test if this file is executed directly
if __name__ == "__main__":
    test_sms()