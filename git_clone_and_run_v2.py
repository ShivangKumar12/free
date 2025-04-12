#!/usr/bin/env python3
import os
import sys
import subprocess
import shutil
import tempfile
import time
import traceback
import json
import re

# Define color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_color(message, color):
    """Print message with specified color"""
    print(f"{color}{message}{Colors.ENDC}")

def print_info(message):
    """Print information message in blue"""
    print_color(f"[INFO] {message}", Colors.BLUE)

def print_success(message):
    """Print success message in green"""
    print_color(f"[SUCCESS] {message}", Colors.GREEN)

def print_warning(message):
    """Print warning message in yellow"""
    print_color(f"[WARNING] {message}", Colors.YELLOW)

def print_error(message):
    """Print error message in red"""
    print_color(f"[ERROR] {message}", Colors.RED)

def print_header(message):
    """Print header message in purple and bold"""
    print_color(f"\n{message}", Colors.HEADER + Colors.BOLD)

def run_command(command, cwd=None, timeout=300, debug=False):
    """
    Run a shell command and return its output
    Added timeout, debug mode, and better error handling
    """
    if debug:
        print_info(f"Running command: {command}")
        if cwd:
            print_info(f"Working directory: {cwd}")
    
    start_time = time.time()
    
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            text=True, 
            capture_output=True,
            cwd=cwd,
            timeout=timeout  # Add timeout to prevent hanging
        )
        
        execution_time = time.time() - start_time
        
        if debug:
            print_info(f"Command completed in {execution_time:.2f} seconds")
        
        if result.stdout:
            if debug or len(result.stdout) < 200:
                print_info(f"Command output: {result.stdout.strip()}")
            else:
                print_info(f"Command output: {result.stdout[:200].strip()}...")
        
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print_error(f"Error executing command: {command}")
        print_error(f"Error output: {e.stderr}")
        if debug:
            print_error(f"Return code: {e.returncode}")
            print_error(f"Command failed after {time.time() - start_time:.2f} seconds")
        return None
    except subprocess.TimeoutExpired:
        print_error(f"Command timed out after {timeout} seconds: {command}")
        return None
    except Exception as e:
        print_error(f"Unexpected error executing command: {command}")
        print_error(f"Error: {str(e)}")
        if debug:
            traceback.print_exc()
        return None

def check_git_installed(debug=False):
    """
    Check if git is installed on the system
    """
    try:
        version = run_command("git --version", debug=debug)
        if version:
            print_success(f"Git is installed: {version}")
            return True
        return False
    except Exception as e:
        print_error(f"Error checking Git installation: {str(e)}")
        return False

def clone_repository(repo_url, target_dir, debug=False):
    """
    Clone the specified Git repository to the target directory
    """
    print_header("CLONING REPOSITORY")
    
    # Make sure the directory doesn't exist to avoid conflicts
    if os.path.exists(target_dir):
        print_warning(f"Target directory {target_dir} already exists. Removing it...")
        try:
            shutil.rmtree(target_dir)
        except Exception as e:
            print_error(f"Error removing directory: {e}")
            # Try force removal with system command
            run_command(f"rm -rf {target_dir}", debug=debug)
    
    # Make sure parent directory exists
    parent_dir = os.path.dirname(target_dir)
    if parent_dir and not os.path.exists(parent_dir):
        os.makedirs(parent_dir)
    
    print_info(f"Cloning repository {repo_url} to {target_dir}...")
    
    # For local repositories, just copy the contents
    if os.path.exists(repo_url) and os.path.isdir(repo_url):
        print_info("Local repository detected, copying files...")
        try:
            shutil.copytree(repo_url, target_dir)
            print_success("Repository copied successfully.")
            return True
        except Exception as e:
            print_error(f"Error copying repository: {e}")
            if debug:
                traceback.print_exc()
            return False
    
    # For GitHub repositories, use git protocol to avoid authentication
    if "github.com" in repo_url:
        print_info("GitHub repository detected, adjusting clone method...")
        # Extract the repo part from the URL
        if repo_url.endswith(".git"):
            repo_url = repo_url[:-4]  # Remove .git suffix if present
        
        parts = repo_url.split('github.com/')
        if len(parts) == 2:
            org_repo = parts[1]  # e.g., "octocat/Hello-World"
            # Use git:// protocol which doesn't require authentication
            git_url = f"git://github.com/{org_repo}.git"
            print_info(f"Converting to git protocol URL: {git_url}")
            result = run_command(f"git clone {git_url} {target_dir}", debug=debug)
        else:
            # Fallback to original URL if parsing fails
            result = run_command(f"git clone {repo_url} {target_dir}", debug=debug)
    else:
        # For non-GitHub repos, try normal clone
        result = run_command(f"git clone {repo_url} {target_dir}", debug=debug)
    
    if result is None:
        print_warning("First clone attempt failed, trying alternative method...")
        # Try using https with token-based authentication (which works for public repos without token)
        if "github.com" in repo_url:
            parts = repo_url.split('github.com/')
            if len(parts) == 2:
                org_repo = parts[1]
                if org_repo.endswith(".git"):
                    org_repo = org_repo[:-4]
                alternative_url = f"https://github.com/{org_repo}.git"
                print_info(f"Trying alternative URL: {alternative_url}")
                result = run_command(f"git clone {alternative_url} {target_dir}", debug=debug)
        
        if result is None:
            print_error("All clone attempts failed.")
            return False
    
    # Verify the directory was created and has content
    if not os.path.exists(target_dir) or not os.listdir(target_dir):
        print_error(f"Repository directory {target_dir} is empty or not created properly.")
        return False
    
    print_success("Repository cloned successfully.")
    return True

def inspect_repository(repo_dir, debug=False):
    """
    Inspect the repository to determine how to run it
    Enhanced to detect more file types and frameworks
    """
    print_header("INSPECTING REPOSITORY")
    
    print_info("Scanning repository contents...")
    file_list = run_command(f"find . -type f | sort", cwd=repo_dir, debug=debug)
    
    if not file_list:
        print_warning("No files found in the repository!")
        return {}
    
    # Print repository structure
    print_info("Repository structure:")
    for file in file_list.split('\n'):
        print(f"  {file}")
    
    # Detect file types and frameworks
    repo_info = {
        "has_readme": os.path.exists(os.path.join(repo_dir, "README.md")),
        "has_python": False,
        "has_node": os.path.exists(os.path.join(repo_dir, "package.json")),
        "has_html": False,
        "has_requirements_txt": os.path.exists(os.path.join(repo_dir, "requirements.txt")),
        "python_files": [],
        "html_files": [],
        "js_files": [],
        "ts_files": [],
        "css_files": [],
        "frameworks": set(),
        "entry_points": []
    }
    
    # Scan for specific files and frameworks
    for root, dirs, files in os.walk(repo_dir):
        for file in files:
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, repo_dir)
            
            # Identify file types
            if file.endswith('.py'):
                repo_info["has_python"] = True
                repo_info["python_files"].append(rel_path)
                # Check for Python frameworks
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'import flask' in content.lower() or 'from flask import' in content.lower():
                        repo_info["frameworks"].add("Flask")
                    if 'import django' in content.lower() or 'from django import' in content.lower():
                        repo_info["frameworks"].add("Django")
                    if 'import fastapi' in content.lower() or 'from fastapi import' in content.lower():
                        repo_info["frameworks"].add("FastAPI")
            
            elif file.endswith('.html'):
                repo_info["has_html"] = True
                repo_info["html_files"].append(rel_path)
            
            elif file.endswith('.js'):
                repo_info["js_files"].append(rel_path)
                # Check for Node.js frameworks
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if 'require("express")' in content or "require('express')" in content:
                        repo_info["frameworks"].add("Express")
                    if 'import express from' in content:
                        repo_info["frameworks"].add("Express")
            
            elif file.endswith('.ts'):
                repo_info["ts_files"].append(rel_path)
            
            elif file.endswith('.css'):
                repo_info["css_files"].append(rel_path)
    
    # Identify probable entry points
    if "app.py" in repo_info["python_files"]:
        repo_info["entry_points"].append(("python", "app.py"))
    if "main.py" in repo_info["python_files"]:
        repo_info["entry_points"].append(("python", "main.py"))
    if "index.html" in repo_info["html_files"]:
        repo_info["entry_points"].append(("html", "index.html"))
    
    # Node.js entry points
    if repo_info["has_node"]:
        package_json_path = os.path.join(repo_dir, "package.json")
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                if "scripts" in package_data:
                    scripts = package_data["scripts"]
                    if "start" in scripts:
                        repo_info["entry_points"].append(("npm", "start"))
                    if "dev" in scripts:
                        repo_info["entry_points"].append(("npm", "dev"))
                if "dependencies" in package_data:
                    deps = package_data["dependencies"]
                    if "react" in deps:
                        repo_info["frameworks"].add("React")
                    if "vue" in deps:
                        repo_info["frameworks"].add("Vue")
                    if "angular" in deps:
                        repo_info["frameworks"].add("Angular")
                    if "express" in deps:
                        repo_info["frameworks"].add("Express")
        except Exception as e:
            print_warning(f"Error parsing package.json: {e}")
    
    # Convert frameworks set to list for easier handling
    repo_info["frameworks"] = list(repo_info["frameworks"])
    
    # Print summary of repository
    print_info("Repository information summary:")
    print(f"  README: {'Yes' if repo_info['has_readme'] else 'No'}")
    print(f"  Python: {'Yes' if repo_info['has_python'] else 'No'}")
    print(f"  Node.js: {'Yes' if repo_info['has_node'] else 'No'}")
    print(f"  HTML: {'Yes' if repo_info['has_html'] else 'No'}")
    print(f"  Python files: {len(repo_info['python_files'])}")
    print(f"  JavaScript files: {len(repo_info['js_files'])}")
    print(f"  TypeScript files: {len(repo_info['ts_files'])}")
    print(f"  HTML files: {len(repo_info['html_files'])}")
    
    if repo_info["frameworks"]:
        print(f"  Detected frameworks: {', '.join(repo_info['frameworks'])}")
    
    if repo_info["entry_points"]:
        print("  Potential entry points:")
        for entry_type, entry_path in repo_info["entry_points"]:
            print(f"    - {entry_type}: {entry_path}")
    
    return repo_info

def install_dependencies(repo_dir, repo_info, debug=False):
    """
    Install any dependencies required by the repository
    Enhanced to support multiple dependency types and provide better feedback
    """
    print_header("INSTALLING DEPENDENCIES")
    
    installation_successful = True
    
    # Install Python dependencies
    if repo_info["has_requirements_txt"]:
        print_info("Installing Python dependencies from requirements.txt...")
        req_file = os.path.join(repo_dir, "requirements.txt")
        
        try:
            # Display the requirements content
            with open(req_file, 'r') as f:
                requirements = f.read().strip()
                print_info("Requirements to install:")
                for line in requirements.split("\n"):
                    if line and not line.startswith("#"):
                        print(f"  - {line}")
            
            # Install dependencies
            result = run_command("pip install -r requirements.txt", cwd=repo_dir, debug=debug)
            if result is None:
                print_error("Failed to install Python dependencies.")
                installation_successful = False
            else:
                # Verify installation
                print_info("Verifying Python dependencies installation...")
                requirements_list = []
                with open(req_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#"):
                            # Extract package name (without version)
                            package_name = re.split('[<>=]', line)[0].strip()
                            requirements_list.append(package_name)
                
                # Check each package
                for package in requirements_list:
                    verify_cmd = f"python -c \"import {package}; print('{package} is installed')\" 2>/dev/null"
                    if run_command(verify_cmd, debug=debug):
                        print_success(f"Successfully installed: {package}")
                    else:
                        print_warning(f"Cannot verify installation of: {package}")
        except Exception as e:
            print_error(f"Error during Python dependency installation: {e}")
            if debug:
                traceback.print_exc()
            installation_successful = False
    elif repo_info["has_python"]:
        print_info("No requirements.txt found, but Python files are present.")
        print_info("The code may rely on standard libraries only or may have implicit dependencies.")
    
    # Install Node.js dependencies
    if repo_info["has_node"]:
        print_info("Installing Node.js dependencies from package.json...")
        try:
            # Display package.json content for reference
            package_json_path = os.path.join(repo_dir, "package.json")
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                if "dependencies" in package_data:
                    print_info("Dependencies to install:")
                    for dep, version in package_data["dependencies"].items():
                        print(f"  - {dep}: {version}")
            
            # Install dependencies using npm
            result = run_command("npm install", cwd=repo_dir, debug=debug, timeout=600)  # Longer timeout for npm
            if result is None:
                print_error("Failed to install Node.js dependencies.")
                installation_successful = False
            else:
                print_success("Node.js dependencies installed successfully.")
        except Exception as e:
            print_error(f"Error during Node.js dependency installation: {e}")
            if debug:
                traceback.print_exc()
            installation_successful = False
    
    if installation_successful:
        print_success("All dependencies installed successfully.")
    else:
        print_warning("Some dependencies may not have been installed correctly.")
    
    return installation_successful

def execute_code(repo_dir, repo_info, debug=False, run_tests=False):
    """
    Execute the code in the repository based on its content
    Enhanced with test mode and better error detection
    """
    print_header("EXECUTING REPOSITORY CODE")
    
    # Display README if available
    if repo_info["has_readme"]:
        readme_path = os.path.join(repo_dir, "README.md")
        try:
            with open(readme_path, 'r') as f:
                readme_content = f.read()
            print_info("README CONTENT:")
            print("=" * 80)
            print(readme_content)
            print("=" * 80)
            print()  # Add a blank line after README
        except Exception as e:
            print_warning(f"Error reading README: {e}")
    
    execution_success = False
    
    # Run code based on entry points
    if repo_info["entry_points"]:
        print_info("Attempting to execute using detected entry points...")
        
        for entry_type, entry_path in repo_info["entry_points"]:
            print_info(f"Trying entry point: {entry_type} - {entry_path}")
            
            if entry_type == "python":
                result = run_command(f"python {entry_path} {'--debug' if debug else ''}", 
                                   cwd=repo_dir, debug=debug)
                if result is not None:
                    print_success(f"Output from {entry_path}:")
                    print("-" * 40)
                    print(result)
                    print("-" * 40)
                    execution_success = True
                    break
            
            elif entry_type == "npm":
                result = run_command(f"npm run {entry_path}", cwd=repo_dir, debug=debug)
                if result is not None:
                    print_success(f"Successfully executed 'npm run {entry_path}'")
                    execution_success = True
                    break
            
            elif entry_type == "html":
                html_path = os.path.join(repo_dir, entry_path)
                print_info(f"Found HTML file: {html_path}")
                print_info("This is a web application. Please open the HTML file in a browser to view it.")
                abs_path = os.path.abspath(html_path)
                print_info(f"File located at: {abs_path}")
                execution_success = True
                break
    
    # If no successful execution yet, try running the first Python file
    if not execution_success and repo_info["has_python"] and repo_info["python_files"]:
        first_py_file = repo_info["python_files"][0]
        print_info(f"No recognized entry point succeeded. Attempting to run the first Python file: {first_py_file}")
        result = run_command(f"python {first_py_file} {'--debug' if debug else ''}", 
                           cwd=repo_dir, debug=debug)
        if result is not None:
            print_success(f"Output from {first_py_file}:")
            print("-" * 40)
            print(result)
            print("-" * 40)
            execution_success = True
    
    # Run test mode if requested
    if run_tests and "debug.py" in repo_info["python_files"]:
        print_header("RUNNING DEBUG TESTS")
        print_info("Running debug tests to check for common errors...")
        result = run_command(f"python debug.py", cwd=repo_dir, debug=debug)
        if result is not None:
            print_success("Debug tests completed:")
            print("-" * 40)
            print(result)
            print("-" * 40)
    
    if not execution_success:
        print_error("Could not determine how to execute the code in this repository.")
        print_info("Please check the repository content and README for instructions.")
        return False
    
    print_success("Repository execution completed.")
    return execution_success

def main():
    print_header("GIT REPOSITORY CLONER AND EXECUTOR")
    
    # Parse command line arguments
    debug_mode = "--debug" in sys.argv
    run_tests = "--test" in sys.argv
    
    # Define the repository URL - using our local sample repository with dependencies
    repo_url = "/home/runner/workspace/sample_repo_v2"
    
    # Check if git is installed
    if not check_git_installed(debug=debug_mode):
        print_error("Git is not installed. Please install git and try again.")
        sys.exit(1)
    
    # Create a directory for the repository
    repo_dir = os.path.join(os.getcwd(), "cloned_repo")
    
    # Clone the repository
    if not clone_repository(repo_url, repo_dir, debug=debug_mode):
        print_error("Failed to clone the repository.")
        sys.exit(1)
    
    # Inspect the repository
    repo_info = inspect_repository(repo_dir, debug=debug_mode)
    
    # Install dependencies
    install_dependencies(repo_dir, repo_info, debug=debug_mode)
    
    # Execute the code
    if not execute_code(repo_dir, repo_info, debug=debug_mode, run_tests=run_tests):
        print_error("Failed to execute the code from the repository.")
        sys.exit(1)
    
    print_header("PROCESS COMPLETED SUCCESSFULLY")

if __name__ == "__main__":
    main()